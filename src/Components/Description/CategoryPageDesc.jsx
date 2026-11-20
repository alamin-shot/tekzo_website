"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";

const CategoryPageDesc = ({ pageDescription, title = "Learn More About Our Categories" }) => {
  return (
    <PageDescription
      title={title}
      description={pageDescription}
    />
  );
};

export default CategoryPageDesc;
