"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import type { BrandDescriptionProps } from "@/types/props/brand";

const BrandDescription = ({ description, title = "Learn More About This Brand" }: BrandDescriptionProps) => {
  return (
    <PageDescription
      title={title}
      description={description}
    />
  );
};

export default BrandDescription;
