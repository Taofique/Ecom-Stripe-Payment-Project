import Stripe from "stripe";
import stripe from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

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
    console.log(`Webhook signature verification failded.`, error.message);
    return new Response("Webhook signature verification filed.", {
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
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }
  } catch (error) {}
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
}
