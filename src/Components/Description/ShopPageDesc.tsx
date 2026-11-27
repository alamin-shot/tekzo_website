"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import type { PageDescWrapperProps } from "@/types/props/content";

const ShopPageDesc = ({ pageDescription, title = "Learn More About Tekzo Shop" }: PageDescWrapperProps) => {
  return (
    <PageDescription
      title={title}
      description={pageDescription}
    />
  );
};

export default ShopPageDesc;
