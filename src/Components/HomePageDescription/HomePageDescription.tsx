"use client";

import type { HomeSectionProps } from "@/types/props/home";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";

export default function HomePageDescription({ companySetting, title = "More About Tekzo" }: HomeSectionProps) {
  return (
    <PageDescription
      title={title}
      companySetting={companySetting}
    />
  );
}
