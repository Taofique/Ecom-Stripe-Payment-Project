type ProPlan = {
  id: "month" | "year";
  title: string;
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  highlighted?: boolean;
};

export const PRO_PLANS: ProPlan[] = [
  {
    id: "month",
    title: "Monthly Pro",
    price: "$19",
    period: "/month",
    features: [
      "Unlimited access to PRO courses",
      "Interactive coding environments",
      "Exclusive Discord community",
      "Monthly live Q&A sessions",
    ],
    ctaText: "Start Monthly Plan",
  },
  {
    id: "year",
    title: "Yearly Pro",
    price: "$190",
    period: "/year",
    features: [
      "All Monthly Pro benefits",
      "Save 17% compared to monthly",
      "Priority support",
      "Exclusive yearly member events",
    ],
    ctaText: "Get Yearly Plan",
    highlighted: true,
  },
];
