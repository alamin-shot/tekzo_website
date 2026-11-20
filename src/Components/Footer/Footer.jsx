"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import FooterBottom from "./FooterBottom";

// lottie-react (and its lottie-web runtime, ~240KB) only ships once the
// footer actually scrolls into view, instead of being fetched immediately
// on every page load for a decorative, below-the-fold background effect.
// ssr:false alone only skips server rendering — it still fetches on mount,
// so this needs an IntersectionObserver gate on top of it.
const FooterAnimations = dynamic(() => import("./FooterAnimations"), {
  ssr: false,
});

const Footer = ({ children, companySetting }) => {
  const [showAnimations, setShowAnimations] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowAnimations(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="relative p-3 md:px-5 lg:px-7 xl:px-10 pb-[84px] my-mt ">
      <div ref={containerRef} className="relative overflow-hidden my-rounded bg-dark z-0">
        {/* Background Animations Layer */}
        {showAnimations && <FooterAnimations />}

        {/* Footer Content Layer */}
        <div className="relative z-10 w-full py-14 px-6 md:px-12 rounded-3xl lg:rounded-[40px]">{children}</div>
      </div>
      <FooterBottom companySetting={companySetting} />
    </footer>
  );
};

export default Footer;
