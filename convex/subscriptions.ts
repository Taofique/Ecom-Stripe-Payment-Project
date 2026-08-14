import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { handler } from "next/dist/build/templates/app-route";

export const getUserSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.currentSubscriptionId) return null;

    const subscription = await ctx.db.get(user.currentSubscriptionId);
    if (!subscription) return null;

    return subscription;
  },
});

export const upsertSubscription = mutation({
  args: {
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    planType: v.union(v.literal("month"), v.literal("year")),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    cancelAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log("=== CONVEX MUTATION START ===");
    console.log("Received args:", args);

    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .unique();

    console.log("Existing subscription found:", !!existingSubscription);
    if (existingSubscription) {
      console.log("Existing subscription data:", {
        id: existingSubscription._id,
        status: existingSubscription.status,
        cancelAtPeriodEnd: existingSubscription.cancelAtPeriodEnd,
        cancelAt: existingSubscription.cancelAt,
      });
    }

    if (existingSubscription) {
      // If subscription was cancelled and cancelAt is set, ensure cancelAtPeriodEnd is true
      const updateData = { ...args };
      if (args.cancelAt && args.cancelAt > Date.now() / 1000) {
        updateData.cancelAtPeriodEnd = true;
        console.log(
          "✅ cancelAt is in future, setting cancelAtPeriodEnd to true",
        );
      }

      console.log("Updating subscription with:", updateData);
      await ctx.db.patch(existingSubscription._id, updateData);

      // Log the updated data
      const updated = await ctx.db.get(existingSubscription._id);
      console.log("✅ Updated subscription:", {
        id: updated?._id,
        status: updated?.status,
        cancelAtPeriodEnd: updated?.cancelAtPeriodEnd,
        cancelAt: updated?.cancelAt,
      });
    } else {
      console.log("Creating new subscription");
      const subscriptionId = await ctx.db.insert("subscriptions", args);
      await ctx.db.patch(args.userId, {
        currentSubscriptionId: subscriptionId,
      });

      // Log the created data
      const created = await ctx.db.get(subscriptionId);
      console.log("✅ Created subscription:", {
        id: created?._id,
        status: created?.status,
        cancelAtPeriodEnd: created?.cancelAtPeriodEnd,
        cancelAt: created?.cancelAt,
      });
    }

    console.log("=== CONVEX MUTATION END ===");
    return { success: true };
  },
});

export const removeSubscription = mutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("=== REMOVE SUBSCRIPTION START ===");
    console.log("Stripe Subscription ID:", args.stripeSubscriptionId);

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .unique();

    if (!subscription) {
      console.log("❌ Subscription not found");
      throw new ConvexError("Subscription not found");
    }

    console.log("Found subscription:", {
      id: subscription._id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    });

    const user = await ctx.db
      .query("users")
      .withIndex("by_currentSubscriptionId", (q) =>
        q.eq("currentSubscriptionId", subscription._id),
      )
      .unique();

    if (user) {
      console.log("Found user with this subscription:", user._id);
      await ctx.db.patch(user._id, { currentSubscriptionId: undefined });
      console.log("✅ Removed subscription reference from user");
    }

    await ctx.db.delete(subscription._id);
    console.log("✅ Deleted subscription from database");
    console.log("=== REMOVE SUBSCRIPTION END ===");

    return { success: true };
  },
});
