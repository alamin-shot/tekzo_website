"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";

const BrandsPageDesc = ({ pageDescription, title = "Learn More About Our Brands" }) => {
  return (
    <PageDescription
      title={title}
      description={pageDescription}
    />
  );
};

export default BrandsPageDesc;
