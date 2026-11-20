"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Swiper + product card images only ship once this slider actually scrolls
// into view, instead of hydrating on initial load for a below-the-fold
// slider. Same pattern as LiveSectionClient / FeatureProductsCategory2Lazy.
const UsedDeviceSectionHomePage = dynamic(
  () => import("./UsedDeviceSectionHomePage"),
  { ssr: false },
);

export default function UsedDeviceSectionHomePageLazy({ products }) {
  const [show, setShow] = useState(false);
  const containerRef = useRef(null);

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
      {show && <UsedDeviceSectionHomePage products={products} />}
    </div>
  );
}
