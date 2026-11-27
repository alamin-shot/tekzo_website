"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import type { PageDescWrapperProps } from "@/types/props/content";

const UsedPhonePageDesc = ({ pageDescription, title = "Learn More About Pre-Owned Devices" }: PageDescWrapperProps) => {
  return (
    <PageDescription
      title={title}
      description={pageDescription}
    />
  );
};

export default UsedPhonePageDesc;
