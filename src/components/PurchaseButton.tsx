"use client";

import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Button } from "./ui/button";

const PurchaseButton = ({ courseId }: { courseId: Id<"courses"> }) => {
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

  if (!userAccess.hasAccess) {
    return <Button variant="outline">Enroll now</Button>;
  }
  return <div>PurchaseButton</div>;
};

export default PurchaseButton;
