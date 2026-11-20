"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Calendar, ArrowUpRight } from "lucide-react";
import { SwiperSlide } from "swiper/react";
import NewsSlider from "../ReuseableComponent/Swiper/NewsSlider";

import { formatHtml } from "@/lib/formatHtml";

function formatDate(dateStr) {
  if (!dateStr) return null;
  // timeZone must be pinned — without it, toLocaleDateString uses the
  // runtime's local zone, which differs between the server (UTC) and a
  // Bangladesh browser (UTC+6), flipping the calendar date for timestamps
  // near midnight UTC and causing a hydration mismatch (React error #418).
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full animate-pulse">
      <div className="relative aspect-5/3 bg-gray-200" />
      <div className="p-4 lg:p-6 flex flex-col flex-1 gap-3">
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
        <div className="h-5 bg-gray-200 rounded-full w-3/4" />
        <div className="h-5 bg-gray-200 rounded-full w-1/2" />
        <div className="flex flex-col gap-2 mt-2">
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="h-3 bg-gray-100 rounded-full w-2/3" />
        </div>
      </div>
    </div>
  );
}

function Modal({ news, onClose }) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollRef = useRef(null);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      const isScrollable = el.scrollHeight > el.clientHeight;
      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
      setShowScrollIndicator(isScrollable && !isAtBottom);
    }
  };

  useEffect(() => {
    // Defer the initial check to avoid synchronous state update
    const timeoutId = setTimeout(checkScroll, 0);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkScroll);
    };
  }, [news]);

  if (!news) return null;

  const publishedDate = formatDate(news.created_at);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="bg-white w-full sm:max-w-2xl lg:max-w-4xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden relative max-h-[100dvh] sm:max-h-[75vh] pb-17 lg:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md text-gray-600 border border-white/30 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-white/40 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Scrollable content — image + body together */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="overflow-y-auto flex-1 no-scrollbar"
        >
          {/* Hero Image */}
          {news.image && (
            <div className="relative w-full aspect-video shrink-0">
              <Image
                src={news.image}
                alt={news.heading || news.name || ""}
                fill
                className="object-cover"
                priority
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                {publishedDate && (
                  <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium mb-2">
                    <Calendar size={12} />
                    <span>{publishedDate}</span>
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow">
                  {news.heading}
                </h2>
              </div>
            </div>
          )}

          {/* No image fallback header */}
          {!news.image && (
            <div className="p-6 sm:p-8 pb-0">
              {publishedDate && (
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-3">
                  <Calendar size={12} />
                  <span>{publishedDate}</span>
                </div>
              )}
              <h2 className="text-xl sm:text-3xl font-bold text-gray-800 leading-tight pr-12">
                {news.heading}
              </h2>
            </div>
          )}

          {/* Body */}
          <div className="p-5 sm:p-8">
            <div
              className="text-gray-500 text-sm sm:text-base leading-relaxed prose prose-sm max-w-none rendered-html"
              dangerouslySetInnerHTML={{ __html: formatHtml(news.description) }}
            />
          </div>
        </div>

        <AnimatePresence>
          {showScrollIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none hidden sm:block"
            >
              <div className="bg-gray-900 text-white px-4 py-2 rounded-full text-[10px] font-bold shadow-2xl animate-bounce">
                SCROLL FOR MORE ↓
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function NewsCard({ news, onClick }) {
  const publishedDate = formatDate(news.created_at);

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(news)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={news.image}
          alt={news.heading || news.name || "News thumbnail"}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge (Optional) */}
        {news.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {news.category}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        {/* Date */}
        {publishedDate && (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-2.5">
            <Calendar size={13} className="text-gray-400" />
            <time>{publishedDate}</time>
          </div>
        )}

        {/* Title */}
        <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-2.5 group-hover:text-secondary transition-colors line-clamp-2 leading-snug">
          {news.heading}
        </h3>

        {/* Description */}
        {/* <div
          className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-0 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: news.description }}
        /> */}

        {/* Card Footer Call-to-action */}
        <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-secondary group-hover:text-secondary/70">
          <span>Read Full Article</span>
          <ArrowUpRight
            size={16}
            className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </div>
      </div>
    </motion.article>
  );
}

export default function HomePageNews({ newsData }) {
  const [selected, setSelected] = useState(null);
  const isLoading = !newsData || newsData.length === 0;

  if (!newsData.length) {
    return <div className="text-center py-20 text-gray-500">No Blog Found</div>;
  }

  return (
    <div className="">
      <div className="">
        <div className="">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))
          ) : (
            <AnimatePresence>
              <NewsSlider>
                {newsData.map((news) => (
                  <SwiperSlide key={news.id}>
                    <NewsCard news={news} onClick={setSelected} />
                  </SwiperSlide>
                ))}
              </NewsSlider>
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <Modal news={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
