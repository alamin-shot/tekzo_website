"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";

const ShopPageDesc = ({ pageDescription, title = "Learn More About Tekzo Shop" }) => {
  return (
    <PageDescription
      title={title}
      description={pageDescription}
    />
  );
};

export default ShopPageDesc;
