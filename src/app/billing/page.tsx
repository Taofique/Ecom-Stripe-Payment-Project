"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { timeStamp } from "console";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const BillingPage = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user?.id } : "skip",
  );

  const subscription = useQuery(
    api.subscriptions.getUserSubscription,
    userData ? { userId: userData._id } : "skip",
  );

  const handleManageBilling = async () => {};

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Billing Management
      </h1>
      <Card className="w-full shadow-lg border-0 overflow-hidden">
        {subscription ? (
          <>
            <CardHeader className="pb-0">
              <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Active Subscription
              </CardTitle>

              <CardDescription className="text-gray-600">
                Manage your subscription details below
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Plan</p>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {subscription.planType}
                  </p>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div></div>
        )}
      </Card>
    </div>
  );
};

export default BillingPage;
