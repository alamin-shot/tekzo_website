"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// Returns true if the URL is a playable video file
function isVideoUrl(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m3u8)(\?|$)/i.test(url);
}

// Renders video or image-with-play-overlay depending on the URL type
function MediaPlayer({
  src,
  autoPlay,
  muted,
  loop,
  playsInline,
  preload,
  className,
  onMuteToggle,
  showMuteBtn,
  isMuted,
}) {
  if (isVideoUrl(src)) {
    return (
      <>
        <video
          src={src}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          preload={preload}
          className={className}
        />
        {showMuteBtn && (
          <button
            onClick={onMuteToggle}
            className="absolute top-4 left-4 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        )}
      </>
    );
  }
  return (
    <Image
      src={src || "/placeholder.jpg"}
      alt="product media"
      fill
      sizes="100vw"
      className={`object-cover ${className}`}
    />
  );
}

// ─── Product detail panel ─────────────────────────────────────────────────────
function ProductDetail({ product, onClose, isMobile }) {
  const productData = product?.product || {};

  return (
    <div className="relative flex flex-col h-full w-full bg-white">
      {/* Close Button - Desktop Only */}
      {!isMobile && (
        <button
          onClick={onClose}
          className="absolute top-4 right-8 lg:top-3 lg:right-3 z-40 w-9 h-9 rounded-full bg-gray-50/90 backdrop-blur-md text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer border border-gray-100"
        >
          <X size={18} />
        </button>
      )}

      <div className="flex  lg:flex-col w-full bg-white rounded-2xl overflow-hidden px-4 ">
        {/* Product Image Section */}
        {/* Mobile/Tablet: side-by-side or fluid row | LG: Stacked with a dedicated aspect-ratio height */}
        <div className="relative w-32 min-w-[40%] lg:w-full aspect-square lg:aspect-video flex items-center justify-center p-4 ">
          <div className="relative w-full h-full transform hover:scale-105 transition-transform duration-500 ease-out">
            <Image
              src={productData?.product_image || "/placeholder.jpg"}
              alt={productData?.product_name || "product"}
              fill
              sizes="(max-width: 1024px) 40vw, 500px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Divider: Visible only on LG when layout stacks vertically */}
        <div className="mx-6 border-t border-gray-100 hidden lg:block"></div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 px-4 py-3 lg:px-6 lg:py-5 justify-between">
          <div>
            {/* Brand Logo */}
            {productData?.brand?.logo && (
              <div className="pb-2 flex justify-start items-center">
                <div className="relative">
                  <Image
                    src={productData.brand.logo}
                    alt={productData.brand.name || "Brand"}
                    width={128}
                    height={96}
                    className="w-12 h-auto object-contain"
                  />
                </div>
              </div>
            )}

            {/* Product Name & Headline */}
            <div className="mb-2 lg:mb-2">
              {/* Adjusted to text-base across mobile and lg to prevent shrinking on desktop */}
              <h3 className="text-sm lg:text-base font-bold text-gray-900 leading-snug line-clamp-2">
                {productData?.product_name}
              </h3>
              {productData?.headline && (
                <p className="text-[10px] text-gray-500 mt-1 font-medium line-clamp-3">
                  {productData.headline}
                </p>
              )}
            </div>

            {/* Price Section */}
            <div className="mb-2 lg:mb-2">
              <div className="flex items-baseline gap-2 lg:gap-3 flex-wrap">
                <span className="text-xl font-bold text-gray-900">
                  ৳{Number(productData?.final_price || 0).toLocaleString()}
                </span>
                {productData?.regular_price &&
                  productData.regular_price !== productData.final_price && (
                    <span className="text-xs lg:text-sm text-gray-600 line-through">
                      ৳{Number(productData.regular_price).toLocaleString()}
                    </span>
                  )}
              </div>
              {productData?.discount_label && (
                <span className="inline-block text-[10px] lg:text-xs font-bold text-primary uppercase tracking-wide mt-0.5">
                  {productData.discount_label}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {/* <div className="mb-4">
              {productData?.is_stock ? (
                <span className="inline-block text-[10px] lg:text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  In Stock
                </span>
              ) : (
                <span className="inline-block text-[10px] lg:text-xs font-medium px-2 py-0.5 rounded bg-red-50 text-red-500">
                  Out of Stock
                </span>
              )}
            </div> */}
          </div>

          {/* CTA Button */}
          <div className="mt-auto pt-2">
            <Link
              prefetch={false}
              href={`/product/${productData?.slug}`}
              className="group w-full flex items-center justify-center gap-2 py-2.5  rounded-xl text-sm  font-semibold bg-primary hover:bg-orange-700 text-white active:scale-[0.98] transition-all shadow-md"
            >
              <span>See Details</span>
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── useIsMobile ──────────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

// ─── Mobile layout: Full Screen ──────────────────────
function MobileTrack({
  products,
  index,
  muted,
  onNavigate,
  onMuteToggle,
  onClose,
}) {
  const product = products[index];
  const touchStartX = useRef(null);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    // if (touchStartX.current === null) return;
    // const dx = e.changedTouches[0].clientX - touchStartX.current;
    // if (Math.abs(dx) > 50) onNavigate(dx < 0 ? 1 : -1);
    // touchStartX.current = null;
  };

  return (
    <div className="relative w-full h-full flex flex-col ">
      {/* mobile video ratio */}
      {/* Video Section - Rounded container */}
      <div
        className="relative mx-4 mt-4 mb-6 rounded-3xl  "
        style={{ height: "50vh" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute inset-0 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MediaPlayer
              key={`mobile-video-${index}`}
              src={product?.video_link || "/demo-section.mp4"}
              autoPlay
              loop
              playsInline
              muted={muted}
              preload="metadata"
              className="w-full h-full object-cover rounded-[40px]"
              showMuteBtn={true}
              isMuted={muted}
              onMuteToggle={onMuteToggle}
            />
          </motion.div>
        </AnimatePresence>
        {/* Top Controls */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 flex items-center justify-center cursor-pointer shadow-lg hover:bg-white"
        >
          <X size={18} />
        </button>
        {/* Navigation Arrows */}
        <button
          onClick={() => onNavigate(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 flex items-center justify-center cursor-pointer shadow-lg hover:bg-white"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => onNavigate(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 flex items-center justify-center cursor-pointer shadow-lg hover:bg-white"
        >
          <ChevronRight size={18} />
        </button>
        {/* Indicators */}
        <div className="absolute bottom-4 right-15 flex justify-center gap-0.5 z-30">
          {products.map((_, i) => (
            <div
              key={i}
              className={`h-1  rounded-[1px] transition-all duration-300 ${
                i === index ? "w-10 bg-primary" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Expand/Collapse Button */}
        <Image
          src={"/reels-moon.svg"}
          alt="reels modal"
          width={300}
          height={300}
          className="absolute -bottom-[40px] left-[94px] z-30 w-9 rotate-90"
        ></Image>
        <button
          onClick={() => onNavigate(1)}
          className="absolute -bottom-6 left-22 z-30 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg"
        >
          <motion.div animate={{ rotate: 0 }} className="transform">
            <ChevronLeft className="rotate-270" size={20} />
          </motion.div>
        </button>
      </div>

      {/* Details Section - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <ProductDetail product={product} onClose={onClose} isMobile={true} />
      </div>
    </div>
  );
}

// ─── Video Track (desktop) ────────────────────────────────────────────────────
function VideoTrack({
  products,
  index,
  muted,
  onNavigate,
  onMuteToggle,
  onClose,
}) {
  const n = products.length;
  const containerRef = useRef(null);
  const [cw, setCw] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setCw(el.offsetWidth);
    const ro = new ResizeObserver(() => setCw(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const SPRING = { type: "spring", stiffness: 400, damping: 38, mass: 0.7 };
  const GAP = 17.5;

  // ─── CONTROL MODAL CONTENT: Adjust these values to control modal size for different devices ───
  const CENTER_H = Math.min(
    typeof window !== "undefined" ? window.innerHeight * 0.88 : 580,
    580,
  );

  // Scale factor for 2xl devices (screens >= 1536px): reduces to 75% of normal size
  // Adjust this multiplier to control 2xl device modal size (0.75 = 75%, 0.85 = 85%, etc.)
  const is2xl = typeof window !== "undefined" && window.innerWidth >= 1536;
  const scale2xl = is2xl ? 0.75 : 1;

  const REDUCED_CENTER_H = CENTER_H * 0.96 * scale2xl; // 20% bigger than before (0.8 * 1.2 = 0.96)
  const SIDE_H = REDUCED_CENTER_H * 0.8;
  const sideW = SIDE_H * (3 / 5);

  const videoW = REDUCED_CENTER_H * (3 / 5);
  const sidePanelW = REDUCED_CENTER_H * (2 / 3);
  const centerW = videoW + sidePanelW;
  const centerLeft = (cw - centerW) / 2;

  const xForDiff = (diff) => {
    if (diff === 0) return centerLeft;
    if (diff === -1) return centerLeft - GAP - sideW;
    if (diff === 1) return centerLeft + centerW + GAP;
    return diff < 0
      ? centerLeft - GAP - sideW + (diff + 1) * (sideW + GAP) - 300
      : centerLeft + centerW + GAP + (diff - 1) * (sideW + GAP) + 300;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full ">
      {cw > 0 &&
        products.map((product, i) => {
          let diff = i - index;
          if (diff > n / 2) diff -= n;
          if (diff < -n / 2) diff += n;

          const isCenter = diff === 0;
          const isVisible = Math.abs(diff) <= 1;
          const x = xForDiff(diff);
          const width = isCenter ? centerW : sideW;
          const zIndex = isCenter ? 20 : isVisible ? 10 : 0;

          return (
            <motion.div
              key={`slot-${i}`}
              className="absolute top-1/2"
              style={{
                width,
                zIndex,
                pointerEvents: isVisible ? "auto" : "none",
              }}
              animate={{
                x,
                y: "-50%",
                opacity: isCenter ? 1 : isVisible ? 1 : 0,
              }}
              transition={SPRING}
            >
              {isCenter ? (
                <div className="flex flex-col items-center">
                  <div
                    className="relative flex rounded-[45px] overflow-hidden shadow-2xl bg-white p-2"
                    style={{ height: REDUCED_CENTER_H }}
                  >
                    <div className="relative">
                      {/* Navigation Arrow on Video - positioned on the video itself */}
                      <div className="">
                        <Image
                          src={"/reels-moon.svg"}
                          alt="reels modal"
                          width={300}
                          height={300}
                          className="absolute -right-[1px] top-[130px] -translate-y-1/2 z-50 w-9 "
                        ></Image>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(1);
                          }}
                          className="absolute -right-6 top-[130px] -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-orange-700 transition-colors"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </div>
                      <div
                        className="shrink-0 rounded-[40px] overflow-hidden"
                        style={{ width: videoW }}
                      >
                        <MediaPlayer
                          key={`center-vid-${i}`}
                          src={product?.video_link || "/demo-section.mp4"}
                          autoPlay
                          loop
                          playsInline
                          muted={muted}
                          preload="auto"
                          className="absolute inset-0 rounded-[40px]   w-full h-full object-cover"
                          showMuteBtn={true}
                          isMuted={muted}
                          onMuteToggle={onMuteToggle}
                        />
                      </div>
                    </div>

                    <div
                      className="relative shrink-0 bg-white overflow-y-auto"
                      style={{ width: sidePanelW }}
                    >
                      <ProductDetail
                        product={product}
                        onClose={onClose}
                        isMobile={false}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="relative w-full rounded-3xl overflow-hidden shadow-xl cursor-pointer"
                  style={{ height: SIDE_H }}
                  onClick={() => onNavigate(diff)}
                >
                  <MediaPlayer
                    key={`side-vid-${i}`}
                    src={product?.video_link || "/demo-section.mp4"}
                    autoPlay
                    loop
                    playsInline
                    muted
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 pointer-events-none" />

                  {/* Product Name Overlay at Bottom - Gradient from black to transparent */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pointer-events-none">
                    <p className="text-white text-[10px] line-clamp-2">
                      {product?.product?.product_name || "Product"}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function LiveProductModal({
  isOpen,
  onClose,
  products,
  initialIndex = 0,
}) {
  const [index, setIndex] = useState(() => initialIndex);
  // Default to false (unmuted) as requested for mobile context
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile(1024);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIndex(initialIndex);
      // Ensure it's unmuted on mobile open
      if (isMobile) setMuted(false);
    }
  }, [isOpen, initialIndex, isMobile]);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [isOpen]);

  const navigate = useCallback(
    (dir) =>
      setIndex((prev) => (prev + dir + products.length) % products.length),
    [products.length],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, navigate, onClose]);

  if (!mounted) return null;

  // ─── CONTROL MODAL CONTENT: Adjust these values to control modal size for different devices ───
  // Scale factor for 2xl devices (screens >= 1536px): reduces to 75% of normal size
  // Adjust this multiplier to control 2xl device modal size (0.75 = 75%, 0.85 = 85%, etc.)
  const is2xl = typeof window !== "undefined" && window.innerWidth >= 1536;
  const scale2xl = is2xl ? 0.75 : 1;

  const CENTER_H =
    Math.min(
      typeof window !== "undefined" ? window.innerHeight * 0.88 : 580,
      580,
    ) * scale2xl;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed  inset-0 z-[5000] flex items-center justify-center bg-black/90 md:bg-black/75 backdrop-blur-xs overflow-hidden"
          onClick={onClose}
        >
          {isMobile ? (
            <motion.div
              key="mobile-stage"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-full bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <MobileTrack
                products={products}
                index={index}
                muted={muted}
                onNavigate={navigate}
                onMuteToggle={() => setMuted((m) => !m)}
                onClose={onClose}
              />
            </motion.div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center ">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(-1);
                }}
                className=" absolute left-10 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={32} />
              </button>

              <motion.div
                key="stage"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full"
                style={{ height: CENTER_H }}
                onClick={(e) => e.stopPropagation()}
              >
                <VideoTrack
                  products={products}
                  index={index}
                  muted={muted}
                  onNavigate={navigate}
                  onMuteToggle={() => setMuted((m) => !m)}
                  onClose={onClose}
                />
              </motion.div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(1);
                }}
                className="absolute right-10 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={32} />
              </button>

              {/* Fixed Indicators - Stay in same position */}
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex justify-center gap-0.5 z-30">
                {products.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-[1px] transition-all duration-300 ${
                      i === index ? "w-16 bg-primary" : "w-4 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
