"use client";

import { useEffect } from "react";

/**
 * Common Modal Component
 * Reusable modal wrapper with customizable header colors and responsive behavior
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback function to close the modal
 * @param {string} title - Modal header title
 * @param {string} icon - SVG path data for the header icon
 * @param {string} gradientFrom - Tailwind gradient start color (e.g., 'blue-500')
 * @param {string} gradientTo - Tailwind gradient end color (e.g., 'blue-600')
 * @param {string} borderColor - Tailwind border color (e.g., 'blue-400')
 * @param {ReactNode} children - Modal body content
 * @param {string} maxWidth - Modal max width class (default: 'lg:w-[600px]')
 */
export default function CommonModal({
  isOpen,
  onClose,
  title,
  icon,
  gradientFrom = "blue-500",
  gradientTo = "blue-600",
  borderColor = "blue-400",
  children,
  maxWidth = "lg:w-[600px]",
}) {
  // Disable background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store original styles
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;

      // Get current scroll position
      const scrollY = window.scrollY;

      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Apply styles to prevent scrolling - aggressive approach
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Cleanup function to restore original styles
      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[50000] flex items-end lg:items-center justify-center overflow-hidden"
      style={{ animation: "fadeIn 0.2s ease" }}
      onTouchMove={(e) => e.preventDefault()}
      onWheel={(e) => e.preventDefault()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault()}
      />

      {/* Modal Container */}
      <div
        className={`
          relative w-full ${maxWidth} bg-white 
          lg:rounded-2xl rounded-t-3xl
          max-h-[85vh] lg:max-h-[80vh] overflow-hidden
          shadow-2xl
        `}
        style={{
          animation:
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? "fadeUp 0.3s ease"
              : "slideUp 0.3s ease",
        }}
      >
        {/* Modal Header */}
        <div
          className={`sticky top-0 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} px-6 py-4  flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={icon}
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] lg:max-h-[calc(80vh-80px)] p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
