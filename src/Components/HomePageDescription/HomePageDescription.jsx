"use client";

import PageDescription from "@/Components/ReuseableComponent/PageDescription";

export default function HomePageDescription({ companySetting, title = "More About Tekzo" }) {
  return (
    <PageDescription
      title={title}
      companySetting={companySetting}
    />
  );
}
