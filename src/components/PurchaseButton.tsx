"use client";

import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";

const PurchaseButton = ({ courseId }: { courseId: Id<"courses"> }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user?.id } : "skip",
  );

  const userAccess = useQuery(
    api.users.getUserAccess,
    userData
      ? {
          userId: userData?._id,
          courseId,
        }
      : "skip",
  ) || { hasAccess: false };

  const handlePurchase = async () => {
    // .....
  };

  if (!userAccess.hasAccess) {
    return (
      <Button variant="outline" onClick={handlePurchase} disabled={isLoading}>
        Enroll now
      </Button>
    );
  }

  if (userAccess.hasAccess) {
    return <Button variant="outline">Enrolled</Button>;
  }

  if (isLoading) {
    return (
      <Button>
        <Loader2Icon className="mr-2 size-4 animate-spin" />
        Processing...
      </Button>
    );
  }
};

export default PurchaseButton;
