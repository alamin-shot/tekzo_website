"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { HomeSectionProps } from "@/types/props/home";

// Swiper + ~72 brand banner images only ship once this slider actually scrolls
// into view, instead of hydrating (and downloading every banner) on initial
// load for a below-the-fold slider. Same pattern as LiveSectionClient.
const FeatureProductsCategory2 = dynamic(
  () => import("./FeatureProductsCategory2"),
  { ssr: false },
);

export default function FeatureProductsCategory2Lazy({ brands }: HomeSectionProps) {
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {show && <FeatureProductsCategory2 brands={brands} />}
    </div>
  );
}
