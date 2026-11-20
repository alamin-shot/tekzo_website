// Tracks nested lock calls so multiple modals can co-exist safely
let lockCount = 0;

export function lockScroll() {
  if (typeof window === "undefined") return;
  if (lockCount === 0) {
    // Measure scrollbar width before hiding it
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    // Compensate for the removed scrollbar so content doesn't jump right
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount++;
}

export function unlockScroll() {
  if (typeof window === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.overscrollBehavior = "";
    document.body.style.paddingRight = "";
  }
}
