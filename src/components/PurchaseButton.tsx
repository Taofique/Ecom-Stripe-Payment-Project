"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";

const PurchaseButton = ({ courseId }: { courseId: Id<"courses"> }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip",
  );

  const userAccess = useQuery(
    api.users.getUserAccess,
    userData
      ? {
          userId: userData._id,
          courseId,
        }
      : "skip",
  ) ?? { hasAccess: false };

  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);

  const handlePurchase = async () => {
    if (!user) {
      alert("Please login to purchase");
      return;
    }

    setIsLoading(true);

    try {
      const { checkoutUrl } = await createCheckoutSession({ courseId });

      if (!checkoutUrl) {
        throw new Error("Failed to create checkout session");
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2"
        disabled
      >
        <Loader2Icon className="h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }

  if (userAccess.hasAccess) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2"
        disabled
      >
        Enrolled
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="hidden sm:flex items-center gap-2"
      onClick={handlePurchase}
    >
      Enroll Now
    </Button>
  );
};

export default PurchaseButton;
