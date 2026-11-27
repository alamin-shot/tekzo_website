"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import type { PageDescWrapperProps } from "@/types/props/content";

const OfferPageDesc = ({ pageDescription, title = "Learn More About Offers & Deals" }: PageDescWrapperProps) => {
  return (
    <PageDescription
      title={title}
      description={pageDescription}
    />
  );
};

export default OfferPageDesc;
