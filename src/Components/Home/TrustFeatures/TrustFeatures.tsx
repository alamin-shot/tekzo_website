"use client";

import { Headphones, PackageCheck, Truck, Shield, BadgeCheck } from "lucide-react";

const TrustFeatures = () => {
  const features = [
    {
      icon: Headphones,
      title: "Available 24/7 to Guide You",
      description: "Reach out anytime—our dedicated team is always online to help you.",
    },
    {
      icon: PackageCheck,
      title: "The Real Deal, Guaranteed",
      description: "Every item in our catalog is rigorously verified and traced directly back to authorized brand distributors.",
    },
    {
      icon: Truck,
      title: "Fastest Delivery",
      description: "Enjoy rapid shipping across Bangladesh, backed by secure handling every step of the way.",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "Shop with complete confidence using our multi-layer encrypted transactions and trusted payment gateways safeguard your financial privacy every time.",
    },
    {
      icon: BadgeCheck,
      title: "Genuine Product",
      description: "Rigorously inspected and verified genuine goods, backed by our authenticity guarantee.",
    },
  ];

  return (
    <section className="bg-gradient-to-tl from-secondary/20 to-secondary/5 rounded-[40px] py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center group">
                {/* Icon Circle */}
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-secondary flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" strokeWidth={2} />
                </div>

                {/* Title */}
                <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustFeatures;
