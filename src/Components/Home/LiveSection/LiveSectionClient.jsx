"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Reels are autoplaying <video> tags plus a framer-motion modal (LiveProductModal).
// ssr:false alone only skips server rendering — it still fetches/mounts (and starts
// playing videos) immediately on load, so this needs an IntersectionObserver gate
// too, deferring the whole grid until the user actually scrolls near this section.
const LiveProducts = dynamic(() => import("./LiveProducts"), { ssr: false });

export default function LiveSectionClient({ reels }) {
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

  return <div ref={containerRef}>{show && <LiveProducts reels={reels} />}</div>;
}
