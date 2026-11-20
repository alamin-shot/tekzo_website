"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";

const OfferPageDesc = ({ pageDescription, title = "Learn More About Offers & Deals" }) => {
  return (
    <PageDescription
      title={title}
      description={pageDescription}
    />
  );
};

export default OfferPageDesc;
