"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PRO_PLANS } from "@/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ProPage = () => {
  const { user, isLoaded: isUserLoaded } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user?.id } : "skip",
  );
  const userSubscription = useQuery(
    api.subscriptions.getUserSubscription,
    userData ? { userId: userData._id } : "skip",
  );

  const isYearlySubscriptionActive =
    userSubscription?.status === "active" &&
    userSubscription.planType === "year";

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <h1 className="text-center font-bold text-4xl mb-4 text-gray-800">
        Choose Your Pro Journey
      </h1>

      <p className="text-center text-xl mb-12 text-gray-600">
        Unlock premium features and accelerate your learning
      </p>

      {isUserLoaded && userSubscription?.status === "active" && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-md">
          <p className="text-blue-700">
            You have an active{" "}
            <span className="font-semibold">{userSubscription.planType}</span>
            subscription
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {PRO_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`flex felx-col transition-all duration-300 ${plan.highlighted ? "border-purple-400 shadow-lg hover:shadow-xl" : "hover:border-purple-200 hover:shadow-md"}`}
          >
            <CardHeader className="grow">
              <CardTitle
                className={`text-2xl ${plan.highlighted ? "text-purple-600" : "text-gray-800"}`}
              >
                {plan.title}
              </CardTitle>

              <CardDescription className="mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-600 ml-1">{plan.period}</span>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProPage;
