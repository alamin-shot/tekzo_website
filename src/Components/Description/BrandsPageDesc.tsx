"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import type { PageDescWrapperProps } from "@/types/props/content";

const BrandsPageDesc = ({ pageDescription, title = "Learn More About Our Brands" }: PageDescWrapperProps) => {
  return (
    <PageDescription
      title={title}
      description={pageDescription}
    />
  );
};

export default BrandsPageDesc;
