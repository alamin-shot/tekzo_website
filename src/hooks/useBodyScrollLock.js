import { useEffect } from "react";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";

export function useBodyScrollLock(isLocked = false) {
  useEffect(() => {
    if (isLocked) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [isLocked]);
}

// Resets any stale scroll lock when navigating to a new page
export function useEnsureScrolling() {
  useEffect(() => {
    unlockScroll();
  }, []);
}
