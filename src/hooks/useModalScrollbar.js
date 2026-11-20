import { useEffect } from "react";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";

export function useModalScrollbar(isOpen) {
  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [isOpen]);
}

/** @deprecated Use useModalScrollbar instead */
export function usePreventBodyScroll(isOpen) {
  return useModalScrollbar(isOpen);
}
