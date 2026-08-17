import Stripe from "stripe";
import stripe from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { NextResponse } from "next/server";
import resend from "@/lib/resend";
import PurchaseConfirmationEmail from "@/emails/PurchaseConfirmationEmail";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    console.log(`Webhook signature verification failed.`, error.message);
    return new Response("Webhook signature verification failed.", {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(
          event.data.object as Stripe.Subscription,
          event.type,
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }
  } catch (error) {
    console.error(`Error processing webhook (${event.type}):`, error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 400 },
    );
  }

  return new Response(null, { status: 200 });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const courseId = session.metadata?.courseId;

  if (typeof session.customer !== "string") {
    throw new Error("Customer ID is missing or expanded.");
  }

  const stripeCustomerId = session.customer;

  if (!courseId || !stripeCustomerId) {
    throw new Error("Missing courseId or stripeCustomerId");
  }

  const user = await convex.query(api.users.getUserByStripeCustomerId, {
    stripeCustomerId: stripeCustomerId,
  });

  if (!user) {
    throw new Error("User not found");
  }

  await convex.mutation(api.purchases.recordPurchase, {
    userId: user._id,
    courseId: courseId as Id<"courses">,
    amount: session.amount_total as number,
    stripePurchaseId: session.id,
  });

  // todo: send success email to user.

  if (
    session.metadata &&
    session.metadata.courseTitle &&
    session.metadata.courseImageUrl
  ) {
    await resend.emails.send({
      from: "MasterClass <onboarding@resend.dev>",
      to: user.email,
      subject: "Purchase Confirmed",
      react: PurchaseConfirmationEmail({
        customerName: user.name,
        courseTitle: session.metadata?.courseTitle,
        courseImage: session.metadata?.courseImageUrl,
        courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}`,
        purchaseAmount: session.amount_total! / 100,
      }),
    });
  }
}

async function handleSubscriptionUpsert(
  subscription: Stripe.Subscription,
  eventType: string,
) {
  console.log("=== STRIPE WEBHOOK RECEIVED ===");
  console.log("Event Type:", eventType);
  console.log("Subscription ID:", subscription.id);
  console.log("=== END STRIPE WEBHOOK HEADER ===");

  const stripeCustomerId = subscription.customer as string;
  const user = await convex.query(api.users.getUserByStripeCustomerId, {
    stripeCustomerId,
  });

  if (!user) {
    throw new Error(
      `User not found for stripe customer id: ${stripeCustomerId}`,
    );
  }

  // Get the first subscription item
  const subscriptionItem = subscription.items.data[0];
  if (!subscriptionItem) {
    throw new Error("No subscription items found");
  }

  // Log subscription details for debugging
  console.log("=== SUBSCRIPTION DETAILS FROM STRIPE ===");
  console.log("Subscription ID:", subscription.id);
  console.log("Status:", subscription.status);
  console.log(
    "cancel_at_period_end (from Stripe):",
    subscription.cancel_at_period_end,
  );
  console.log("cancel_at (from Stripe):", subscription.cancel_at);
  console.log("canceled_at (from Stripe):", subscription.canceled_at);
  console.log("cancellation_details:", subscription.cancellation_details);
  console.log("current_period_end:", subscriptionItem.current_period_end);
  console.log("current_period_start:", subscriptionItem.current_period_start);
  console.log("plan_interval:", subscriptionItem.plan?.interval);
  console.log("=== END SUBSCRIPTION DETAILS ===");

  // Determine if subscription should be marked as cancelAtPeriodEnd
  // If there's a cancellation reason AND a future cancel_at date, it's scheduled to end
  let cancelAtPeriodEnd = subscription.cancel_at_period_end;

  // Check if subscription has been cancelled but will end at period end
  if (subscription.cancellation_details?.reason) {
    // If cancel_at exists and is in the future, it's scheduled for end of period
    if (
      subscription.cancel_at &&
      subscription.cancel_at > Math.floor(Date.now() / 1000)
    ) {
      cancelAtPeriodEnd = true;
      console.log(
        `✅ Subscription ${subscription.id} is scheduled to cancel at period end`,
      );
    }
    // If canceled_at exists but no cancel_at, it was cancelled immediately
    else if (subscription.canceled_at) {
      cancelAtPeriodEnd = false;
      console.log(
        `❌ Subscription ${subscription.id} was cancelled immediately`,
      );
    }
  }

  try {
    await convex.mutation(api.subscriptions.upsertSubscription, {
      userId: user._id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      planType:
        (subscriptionItem.plan?.interval as "month" | "year") || "month",
      currentPeriodStart: subscriptionItem.current_period_start,
      currentPeriodEnd: subscriptionItem.current_period_end,
      cancelAtPeriodEnd: cancelAtPeriodEnd,
      cancelAt: subscription.cancel_at || undefined,
    });

    console.log(
      `✅ Successfully processed ${eventType} for subscription ${subscription.id}`,
    );
    console.log(`   cancelAtPeriodEnd set to: ${cancelAtPeriodEnd}`);
    console.log(`   cancelAt set to: ${subscription.cancel_at || "undefined"}`);
    console.log("=== END WEBHOOK PROCESSING ===");
  } catch (error) {
    console.error(
      `Error processing ${eventType} for subscription ${subscription.id}:`,
      error,
    );
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("=== SUBSCRIPTION DELETED ===");
  console.log("Subscription ID:", subscription.id);

  try {
    await convex.mutation(api.subscriptions.removeSubscription, {
      stripeSubscriptionId: subscription.id,
    });

    console.log(`✅ Successfully deleted subscription ${subscription.id}`);
    console.log("=== END SUBSCRIPTION DELETED ===");
  } catch (error) {
    console.error(`Error deleting subscription ${subscription.id}:`, error);
  }
}
