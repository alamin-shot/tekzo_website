"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { SwiperSlide } from "swiper/react";
import SwiperSlider4 from "../ReuseableComponent/Swiper/SwiperSlider4";

import { formatHtml } from "@/lib/formatHtml";
import type { NewsHomeCardProps, NewsHomeModalProps, NewsProps } from "@/types/props/content";
import { fieldsOf, mapList, requireString } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

function Modal({ news: entry, onClose }: NewsHomeModalProps) {
  // `news.x` throws for a null value, as before
  const news = fieldsOf(entry);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  if (!news) return null;

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      const isScrollable = el.scrollHeight > el.clientHeight;
      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
      setShowScrollIndicator(isScrollable && !isAtBottom);
    }
  };

  useEffect(() => {
    checkScroll();
    const timeout = setTimeout(checkScroll, 500);
    window.addEventListener("resize", checkScroll);
    return () => {
      window.removeEventListener("resize", checkScroll);
      clearTimeout(timeout);
    };
  }, [entry]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl lg:max-w-5xl lg:max-h-[70vh] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- FIXED HEADER (Close Button) --- */}
        <div className="absolute top-4 right-4  z-1100">
          <button
            onClick={onClose}
            className="bg-black/20 cursor-pointer hover:bg-primary backdrop-blur-md text-white rounded-full p-2 transition-all duration-300 shadow-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- MAIN CONTENT (Scrollable Area) --- */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex-1 overflow-y-auto scroll-smooth no-scrollbar"
        >
          {/* Header Image */}
          <div className="relative w-full aspect-video lg:h-[450px]">
            <Image
              src={str(news.image) ?? ""}
              alt={str(news.heading) ?? ""}
              fill sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {/* Gradient Overlay for Title */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          {/* Text Content */}
          <div className="px-6 pb-12 sm:px-12 -mt-10 relative z-10">
            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-800 mb-6 leading-tight">
                {nodeOf(news.heading)}
              </h2>

              {/* HTML Description with Prose styling */}
              <div
                className="prose prose-sm sm:prose-lg max-w-none text-gray-600 
                prose-img:rounded-2xl prose-img:shadow-lg prose-p:leading-relaxed rendered-html"
                dangerouslySetInnerHTML={{ __html: formatHtml(news.description) }}
              />
            </div>
          </div>
        </div>

        {/* --- SCROLL INDICATOR --- */}
        <AnimatePresence>
          {showScrollIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-100 pointer-events-none"
            >
              <div className="bg-gray-900 text-white px-5 py-2 rounded-full text-[11px] font-extrabold shadow-2xl animate-bounce tracking-widest uppercase">
                Scroll for more ↓
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function NewsCard({ news: entry, onClick }: NewsHomeCardProps) {
  const news = fieldsOf(entry);
  // `.replace` on a truthy non-string threw; kept
  const plainDescription = news.description
    ? requireString(news.description).replace(/<[^>]*>?/gm, "")
    : "";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(entry)}
      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group flex flex-col h-full mb-8 "
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={str(news.image) ?? ""}
          alt={str(news.heading) ?? ""}
          fill sizes="(max-width: 1023px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
      </div>

      <div className="p-2 lg:p-7 flex flex-col flex-1">
        <h3 className="text-base lg:text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {nodeOf(news.heading)}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
          {plainDescription}
        </p>
      </div>
    </motion.article>
  );
}

export default function NewsHomePage({ newsData }: NewsProps) {
  const [selected, setSelected] = useState<unknown>(null);

  return (
    <div className="">
      <div className="max-w-[1400px] mx-auto">
        <SwiperSlider4>
          {mapList(newsData, (news) => (
            <SwiperSlide key={idKey(news)}>
              <NewsCard news={news} onClick={setSelected} />
            </SwiperSlide>
          ))}
        </SwiperSlider4>
      </div>

      <AnimatePresence>
        {nodeOf(selected && (
          <Modal news={selected} onClose={() => setSelected(null)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
