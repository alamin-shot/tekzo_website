"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import type { PageDescWrapperProps } from "@/types/props/content";

const CategoryPageDesc = ({ pageDescription, title = "Learn More About Our Categories" }: PageDescWrapperProps) => {
  return (
    <PageDescription
      title={title}
      description={pageDescription}
    />
  );
};

export default CategoryPageDesc;
