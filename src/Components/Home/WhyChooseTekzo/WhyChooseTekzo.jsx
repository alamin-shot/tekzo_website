import React from "react";
import { FaCheckCircle, FaShieldAlt, FaTags, FaCreditCard, FaHeadset, FaTruck } from "react-icons/fa";

const benefits = [
  {
    icon: FaCheckCircle,
    title: "Absolute Factory-Fresh Authenticity",
    description:
      "When you buy brand-new, you deserve zero doubt—not resealed boxes or gray-market compromises. At TEKZO, our Absolute Factory-Fresh Authenticity ensures every smartphone, earbud, smartwatch, and power accessory arrives straight from authorized channels in untouched, original packaging. Experience pristine, genuine technology delivered exactly as the manufacturer intended.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: FaShieldAlt,
    title: "Backed by Manufacturer Warranties and Effortless Replacements",
    description: "Zero post-purchase anxiety: enjoy complete manufacturer protection and transparent, hassle-free replacements on every device.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: FaTags,
    title: "Transparent Pricing With Maximum Value",
    description:
      "True innovation shouldn't come with an inflated price tag. We deliver competitive, transparent pricing across elite names like Apple, Samsung, Honor, OnePlus, Nothing, Anker, and Voltme—backed by TEKZO's exclusive seasonal promotions that maximize every taka you spend.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: FaCreditCard,
    title: "Upgrade Now, Pay on Your Own Terms",
    description:
      "Upgrading your ecosystem is completely stress-free with TEKZO's versatile financial options. Enjoy tailored Credit Card EMIs, smooth digital wallet transfers (bKash/Nagad), secure card payments, and trusted Cash on Delivery delivered right to your doorstep nationwide.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: FaHeadset,
    title: "Expert Guidance and Responsive Client Care",
    description:
      "Our seasoned tech advisors provide personalized guidance— navigating complex regional smartphone variants and specifications to curating accessories tailored to your lifestyle, we deliver a consultative experience both in-store and digitally.",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: FaTruck,
    title: "Secure Doorstep Delivery",
    description: "Secure, Drop-Proof Packaging • Trusted Parcel Check • Live Order Tracking",
    gradient: "from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
];

export default function WhyChooseTekzo() {
  const featured = benefits.slice(0, 2);
  const secondary = benefits.slice(2);

  return (
    <section>
      <div className="">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Smart Shoppers Choose <span className="text-secondary">TEKZO?</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">Amplifying your digital experience with pristine, genuine devices and a support team dedicated entirely to you.</p>
        </div>

        {/* Mobile: All Horizontal Cards */}
        <div className="flex flex-col gap-4 lg:hidden">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${benefit.gradient} rounded-3xl p-5 
                           flex items-center gap-4 shadow-xs 
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
                  <h3 className="text-base font-bold text-gray-900 mb-1">{benefit.title}</h3>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Asymmetric Grid */}
        <div className="hidden lg:grid grid-cols-12 gap-5 items-stretch">
          {/* Left Column - 2 Large Featured Cards */}
          <div className="col-span-5 flex flex-col gap-5 ">
            {featured.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className={`flex-1 bg-gradient-to-br ${benefit.gradient} rounded-[40px] p-8 
                           flex flex-col items-center justify-center text-center
                           shadow-xs hover:shadow-md 
                           transition-all duration-300 group`}
                >
                  <div
                    className={`w-16 h-16 ${benefit.iconBg} ${benefit.iconColor} rounded-[40px] 
                             flex items-center justify-center mb-5 shrink-0 
                             group-hover:scale-110 transition-transform duration-300 shadow-sm bg-white/80`}
                  >
                    <Icon className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-base text-gray-700 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          {/* Right Column - 4 Stacked Horizontal Cards */}
          <div className="col-span-7 flex flex-col justify-between gap-4">
            {secondary.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className={`flex-1 bg-gradient-to-br ${benefit.gradient} rounded-3xl p-5 
                           flex items-center gap-4 shadow-xs 
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
                    <h3 className="text-base font-bold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
