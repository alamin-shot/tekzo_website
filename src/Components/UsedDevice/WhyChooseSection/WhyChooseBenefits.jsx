import React from "react";
import {
  FaCheckCircle,
  FaDollarSign,
  FaTruck,
  FaBox,
  FaShieldAlt,
  FaSyncAlt,
} from "react-icons/fa";

const benefits = [
  {
    icon: FaCheckCircle,
    title: "100% Tested Devices",
    description:
      "Every phone, laptop, and MacBook is fully checked by experts so you get smooth and reliable performance.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: FaDollarSign,
    title: "Best Price Guaranteed",
    description:
      "Get top-quality pre-owned devices at fair, pocket-friendly prices without breaking the bank.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: FaTruck,
    title: "Fast Delivery",
    description:
      "Quick and safe home delivery available all across Bangladesh.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: FaBox,
    title: "Safe Packaging",
    description:
      "All items are packed carefully to prevent any damage during delivery.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: FaShieldAlt,
    title: "Official Warranty",
    description:
      "Stay worry-free with our solid warranty protection plans on every device.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: FaSyncAlt,
    title: "15 Days Replacement",
    description:
      "Easy and fast 15-day replacement policy if you face any issues.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
];

export default function WhyChooseBenefits() {
  const featured = benefits.slice(0, 2);
  const secondary = benefits.slice(2);

  return (
    <section className="pt-8">
      {/* Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column - 2 Large Featured Cards */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {featured.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className={`flex-1 bg-gradient-to-br ${benefit.gradient} rounded-2xl p-6 lg:p-8 
                           flex flex-col items-center justify-center text-center 
                           border border-secondary/10 shadow-xs hover:shadow-md 
                           transition-all duration-300 group`}
              >
                <div
                  className={`w-16 h-16 ${benefit.iconBg} ${benefit.iconColor} rounded-2xl 
                             flex items-center justify-center mb-5 shrink-0 
                             group-hover:scale-110 transition-transform duration-300 shadow-sm bg-white/80`}
                >
                  <Icon className="text-3xl" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column - 4 Stacked Horizontal Cards */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {secondary.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className={`flex-1 bg-gradient-to-br ${benefit.gradient} rounded-xl p-5 
                           flex items-center gap-4 border border-secondary/10 shadow-xs 
                           hover:shadow-md transition-all duration-300 group`}
              >
                <div
                  className={`w-12 h-12 ${benefit.iconBg} ${benefit.iconColor} rounded-lg 
                             flex items-center justify-center shrink-0 
                             group-hover:scale-110 transition-transform duration-300 shadow-sm bg-white/80`}
                >
                  <Icon className="text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
