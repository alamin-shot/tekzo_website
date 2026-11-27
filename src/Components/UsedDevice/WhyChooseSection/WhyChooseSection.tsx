import React from "react";
import WhyChooseFeatures from "./WhyChooseFeatures";
import WhyChooseBenefits from "./WhyChooseBenefits";
import type { WhyChooseSectionProps } from "@/types/props/product";
import { nodeOf } from "@/lib/render";

export default function WhyChooseSection({ brandName = "Tekzo" }: WhyChooseSectionProps) {
  return (
    <section className=" my-mt2">
      <div className="container">
        {/* Top Features Grid */}
        <WhyChooseFeatures />

        {/* Main Heading */}
        <div className="text-center my-mt2">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Why Choose <span className="text-secondary">{nodeOf(brandName)}</span> for Your Used Devices?
          </h2>
          <p className="mt-4 text-gray-600 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
            {nodeOf(brandName)} is your trusted source in Bangladesh for reliable, affordable, and quality-tested used phones, laptops, and MacBooks that feel like new.
          </p>
        </div>

        {/* Benefits Grid */}
        <WhyChooseBenefits />
      </div>
    </section>
  );
}
