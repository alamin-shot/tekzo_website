"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";

const UsedPhonePageDesc = ({ pageDescription, title = "Learn More About Pre-Owned Devices" }) => {
  return (
    <PageDescription
      title={title}
      description={pageDescription}
    />
  );
};

export default UsedPhonePageDesc;
