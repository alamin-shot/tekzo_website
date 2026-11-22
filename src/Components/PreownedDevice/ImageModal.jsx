"use client";

import { useState, useEffect, useRef } from "react";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  setIsSidebarOpen,
  productTitle = "Product",
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const imageContainerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, distance: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      unlockScroll();
    }

    return () => unlockScroll();
  }, [isOpen, initialIndex]);

  // Handle keyboard navigation and space key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
      if (e.key === "+") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") handleResetZoom();
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen, currentIndex]);

  // Handle Ctrl+Wheel zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const delta = e.deltaY > 0 ? -0.5 : 0.5;
      setZoom((prev) => Math.max(1, Math.min(prev + delta, 4)));
    };

    const container = imageContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [isOpen]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse drag handlers - only work when space is pressed
  const handleMouseDown = (e) => {
    if (!isSpacePressed || zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isSpacePressed || zoom <= 1) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Limit drag boundaries
    const maxX =
      (imageContainerRef.current?.offsetWidth || 0) * (zoom - 1) * 0.5;
    const maxY =
      (imageContainerRef.current?.offsetHeight || 0) * (zoom - 1) * 0.5;

    setPosition({
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for pinch zoom and drag
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
      touchStartRef.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        distance,
      };
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );

      const scale = distance / touchStartRef.current.distance;
      const newZoom = Math.max(1, Math.min(zoom * scale, 4));
      setZoom(newZoom);

      touchStartRef.current.distance = distance;
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      // Single touch drag
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;

      const maxX =
        (imageContainerRef.current?.offsetWidth || 0) * (zoom - 1) * 0.5;
      const maxY =
        (imageContainerRef.current?.offsetHeight || 0) * (zoom - 1) * 0.5;

      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY)),
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!mounted) return null;

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9999 bg-black/95 flex flex-col"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white text-sm font-medium">
              Image {currentIndex + 1} of {images.length}
            </div>

            {/* Product Title in Center */}
            <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 text-white text-sm font-semibold truncate max-w-xs">
              {productTitle}
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  className="p-2 hover:bg-gray-700 rounded transition-colors text-white"
                  title="Zoom Out (- key)"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-white text-xs px-2 min-w-[40px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  className="p-2 hover:bg-gray-700 rounded transition-colors text-white"
                  title="Zoom In (+ key)"
                >
                  <ZoomIn size={18} />
                </button>
              </div>

              {/* Reset Zoom */}
              {zoom !== 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetZoom();
                  }}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                  title="Reset Zoom (0 key)"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              )}

              {/* Space Drag Indicator */}
              {zoom > 1 && (
                <div
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                    isSpacePressed
                      ? "bg-secondary text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {isSpacePressed ? "🖱️ Dragging" : "Hold Space + Drag"}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 hover:bg-gray-700 rounded transition-colors text-white"
                title="Close (Esc)"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div
            ref={imageContainerRef}
            className="flex-1 flex items-center justify-center overflow-hidden relative bg-black"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor:
                isSpacePressed && zoom > 1
                  ? isDragging
                    ? "grabbing"
                    : "grab"
                  : "default",
            }}
          >
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: zoom,
                  x: position.x,
                  y: position.y,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <Image
                  src={currentImage?.image || currentImage}
                  alt={`Image ${currentIndex + 1}`}
                  fill sizes="100vw"
                  className="object-contain select-none"
                  priority
                  fetchPriority="high"
                  draggable={false}
                />
              </motion.div>
            </motion.div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-10"
                  title="Previous (← key)"
                >
                  <ChevronLeft size={28} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-10"
                  title="Next (→ key)"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div
              className="bg-black/50 backdrop-blur-sm p-4 border-t border-gray-700 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center gap-2">
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                      setZoom(1);
                      setPosition({ x: 0, y: 0 });
                      setIsSidebarOpen(true);
                    }}
                    className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                      idx === currentIndex
                        ? "ring-2 ring-white"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Image
                      src={img?.image || img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill sizes="(max-width: 1023px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Hints */}
          <div
            className="bg-black/50 backdrop-blur-sm px-4 py-2 text-center text-gray-400 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            Arrow keys to navigate • Ctrl+Scroll to zoom • Space+Drag to move •
            +/- to zoom • 0 to reset • Esc to close
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
