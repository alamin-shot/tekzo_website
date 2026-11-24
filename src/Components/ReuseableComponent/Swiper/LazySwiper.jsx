"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper } from "swiper/react";

// Drop-in replacement for <Swiper> for carousels that are usually below the
// fold. Until the carousel comes within `rootMargin` of the viewport it
// renders the exact markup Swiper itself renders before it initializes
// (div.swiper > div.swiper-wrapper > slides, plus the empty pagination /
// navigation / scrollbar containers), so SSR HTML and what users see before
// that point are unchanged. Swiper JS then mounts and initializes as before.
//
// Why: every Swiper measures layout when it initializes (clientWidth,
// getComputedStyle, breakpoints), which forces reflows and long tasks during
// hydration — exactly when early taps happen (INP) and what Lighthouse
// counts as TBT. Off-screen carousels now pay that cost only when needed.
//
// Note: Swiper React always calls swiper.init() on mount, so `init={false}`
// can't be used for this; the component itself has to mount later.

// Mirrors swiper/react's needsNavigation/needsPagination/needsScrollbar:
// a container div is rendered only when the param is enabled and no
// external element was given.
function needs(param, keys) {
  if (!param) return false;
  if (param === true) return true;
  return keys.every((k) => typeof param[k] === "undefined");
}

export default function LazySwiper({ rootMargin = "250px 0px", children, className, style, ...swiperProps }) {
  const [active, setActive] = useState(false);
  const placeholderRef = useRef(null);

  useEffect(() => {
    if (active) return;
    const el = placeholderRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setActive(true);
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active, rootMargin]);

  if (active) {
    return (
      <Swiper className={className} style={style} {...swiperProps}>
        {children}
      </Swiper>
    );
  }

  return (
    <div ref={placeholderRef} className={`swiper${className ? ` ${className}` : ""}`} style={style}>
      <div className="swiper-wrapper">{children}</div>
      {needs(swiperProps.navigation, ["nextEl", "prevEl"]) && (
        <>
          <div className="swiper-button-prev" />
          <div className="swiper-button-next" />
        </>
      )}
      {needs(swiperProps.scrollbar, ["el"]) && <div className="swiper-scrollbar" />}
      {needs(swiperProps.pagination, ["el"]) && <div className="swiper-pagination" />}
    </div>
  );
}
