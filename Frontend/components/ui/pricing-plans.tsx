"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { IconCheck, IconX } from "@tabler/icons-react";

type PlanFeature = {
  title: string;
  included: boolean;
};

type Plan = {
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
};

const plans: Plan[] = [
  {
    name: "Basic",
    price: 2000,
    description: "Perfect for individuals and small teams.",
    buttonText: "Get Started",
    features: [
      { title: "Basic audience simulation", included: true },
      { title: "Up to 5 simulations per month", included: true },
      { title: "Standard analytics", included: true },
      { title: "Email support", included: true },
      { title: "Advanced sentiment analysis", included: false },
      { title: "Custom audience segments", included: false },
    ],
  },
  {
    name: "Pro",
    price: 5000,
    description: "For professionals and growing businesses.",
    buttonText: "Upgrade to Pro",
    popular: true,
    features: [
      { title: "Advanced audience simulation", included: true },
      { title: "Up to 20 simulations per month", included: true },
      { title: "Advanced analytics", included: true },
      { title: "Advanced sentiment analysis", included: true },
      { title: "Custom audience segments", included: true },
      { title: "Priority support", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: 10000,
    description: "For large-scale organizations.",
    buttonText: "Contact Sales",
    features: [
      { title: "Enterprise-grade simulation", included: true },
      { title: "Unlimited simulations", included: true },
      { title: "Custom analytics dashboard", included: true },
      { title: "API access & priority support", included: true },
      { title: "Dedicated 24/7 support", included: true },
      { title: "Custom audience segments", included: true },
    ],
  },
];

export function PricingPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const getAdjustedPrice = (price: number) => {
    if (billingCycle === "yearly") {
      return Math.round(price * 10 * 0.8); // 20% discount for yearly
    }
    return price;
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
          Unlock powerful simulation tools for your content strategy.
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <div className="relative bg-black border border-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "relative z-10 py-2 px-5 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200",
              billingCycle === "monthly"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "relative z-10 py-2 px-5 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200",
              billingCycle === "yearly"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            Yearly
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-white text-black">
              20% OFF
            </span>
          </button>
          <motion.div
            className="absolute inset-0 z-0 rounded-md bg-gray-700"
            initial={false}
            animate={{
              x: billingCycle === "monthly" ? "0%" : "100%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              width: billingCycle === "monthly" ? "calc(50% - 4px)" : "calc(50% - 4px)",
              margin: "4px",
            }}
          />
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            className={cn(
              "relative rounded-2xl border bg-black shadow-xl transition-all duration-300",
              plan.popular
                ? "border-white lg:scale-105 z-10"
                : "border-gray-800",
              hoveredPlan === index && !plan.popular ? "border-gray-600" : ""
            )}
            onMouseEnter={() => setHoveredPlan(index)}
            onMouseLeave={() => setHoveredPlan(null)}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {plan.popular && (
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                <span className="inline-flex rounded-full bg-white px-4 py-1 text-sm font-semibold text-black">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-6">
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-white">
                  ₹{getAdjustedPrice(plan.price).toLocaleString()}
                </span>
                <span className="ml-1 text-lg font-semibold text-gray-400">
                  /{billingCycle === "monthly" ? "mo" : "yr"}
                </span>
              </div>
              <p className="mt-4 text-gray-400 h-10">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {feature.included ? (
                        <IconCheck className="h-5 w-5 text-green-500" />
                      ) : (
                        <IconX className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "ml-2 text-sm",
                        feature.included ? "text-gray-300" : "text-gray-500"
                      )}
                    >
                      {feature.title}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-full rounded-lg py-2.5 px-4 text-center text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black",
                    plan.popular
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  )}
                >
                  {plan.buttonText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-xl font-bold text-white">
          Need a custom solution?
        </h3>
        <p className="mt-3 text-gray-400 max-w-md mx-auto">
          Contact us for a tailored plan that meets your specific requirements.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 inline-flex items-center rounded-lg border border-transparent bg-white px-5 py-2.5 text-sm font-medium text-black shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        >
          Contact Sales
        </motion.button>
      </div>
    </div>
  );
}