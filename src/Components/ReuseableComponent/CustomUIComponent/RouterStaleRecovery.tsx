"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Next's client-side router cache can go stale after a tab sits idle for a
// while (background tab, sleep, long inactivity) — router.push() then
// silently hangs with no error. This used to be handled inside every
// PreFetchLink instance individually; centralizing it here as a single
// delegated click listener means every "data-nav-recovery" link on the site
// gets the same fallback without each one paying its own hydration cost
// (useRouter + usePathname + effects) for it. Mounted once in the root
// layout.
//
// KNOWN BUG #6 (preserved): the fallback compares pathname only and fires
// after 2 s, so slow navigations and query-only links get a hard reload.
export default function RouterStaleRecovery() {
  const pathname = usePathname();
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Route changed — any pending fallback from a previous click already did
  // its job (or is moot), so cancel it.
  useEffect(() => {
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // `e.target.closest(...)`: click targets are Elements; anything else
      // (no closest method) threw before, and simply has no anchor here.
      if (!(e.target instanceof Element)) return;
      const anchor = e.target.closest("a[data-nav-recovery]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || /^([a-z][a-z0-9+.-]*:)?\/\//i.test(href)) {
        return;
      }

      if (fallbackRef.current) clearTimeout(fallbackRef.current);

      const startPathname = window.location.pathname;
      fallbackRef.current = setTimeout(() => {
        if (window.location.pathname === startPathname) {
          window.location.href = href;
        }
      }, 2000);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
