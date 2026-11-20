import React, { useEffect } from "react";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import { motion, AnimatePresence } from "framer-motion";

export default function EmiModal({ isOpen, onClose, children }) {
  useEffect(() => {
    const preventScroll = (e) => {
      const modalContent = document.querySelector(".modal-content");
      if (modalContent && modalContent.contains(e.target)) return;
      e.preventDefault();
    };

    if (isOpen) {
      lockScroll();
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.addEventListener("wheel", preventScroll, { passive: false });
      document.addEventListener("touchmove", preventScroll, { passive: false });
    } else {
      unlockScroll();
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
    }

    return () => {
      unlockScroll();
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop layer (Clicking here closes modal) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Modal Container Content Layer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative bg-white w-full max-w-[1000px] h-[65vh] lg:h-[70vh] rounded-2xl lg:rounded-[30px] shadow-xl z-10 modal-content "
          >
            {/* Close Cross Button Top-Right */}
            <button
              onClick={onClose}
              type="button"
              className="absolute -top-12 right-0  p-1.5 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 cursor-pointer"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Injected Content */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
