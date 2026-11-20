"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";

const BrandDescription = ({ description, title = "Learn More About This Brand" }) => {
  return (
    <PageDescription
      title={title}
      description={description}
    />
  );
};

export default BrandDescription;
