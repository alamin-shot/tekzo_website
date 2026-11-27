"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Calendar, ArrowRight } from "lucide-react";
import { switzer } from "@/lib/fonts";
import Title from "../ReuseableComponent/Title";
import type { NewsCardProps, NewsModalProps, NewsProps } from "@/types/props/content";
import { fieldsOf, lengthOpt, mapList, toDateInput } from "@/lib/json";
import { keyFrom, nodeOf, str } from "@/lib/render";

/* ---------- helpers ---------- */

import { formatHtml } from "@/lib/formatHtml";

function formatDate(dateStr: unknown): string | null {
  if (!dateStr) return null;
  // timeZone must be pinned — without it, toLocaleDateString uses the
  // runtime's local zone, which differs between the server (UTC) and a
  // Bangladesh browser (UTC+6), flipping the calendar date for timestamps
  // near midnight UTC and causing a hydration mismatch (React error #418).
  return new Date(toDateInput(dateStr)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

/* ---------- skeleton ---------- */

function NewsCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse py-2">
      <div className="w-full aspect-[16/10] bg-[#E4DFD3] rounded" />
      <div className="h-3 bg-[#E4DFD3] rounded-full w-1/4 mt-2" />
      <div className="h-5 bg-[#E4DFD3] rounded-full w-5/6" />
      <div className="h-4 bg-[#E4DFD3] rounded-full w-full" />
    </div>
  );
}

/* ---------- modal ---------- */

function Modal({ news: entry, index, onClose, totalCount }: NewsModalProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [entry]);

  if (!entry) return null;
  // `news.x` on a truthy value (a primitive has no fields, as before)
  const news = fieldsOf(entry);

  const publishedDate = formatDate(news.created_at);
  const dispatchNo = String(Number(totalCount) - index).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${switzer.variable} fixed inset-0 z-999 flex items-end sm:items-center justify-center bg-[#1B1815]/75 backdrop-blur-sm sm:p-6`}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="pb-20 lg:pb-0 bg-white w-full sm:max-w-2xl lg:max-w-4xl lg:rounded-[40px] flex flex-col shadow-2xl overflow-hidden relative h-screen sm:h-[80vh]  "
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close article"
          className="absolute top-4 right-4 z-20 bg-[#F7F4EE]/90 text-[#1B1815] border border-[#1B1815]/20 w-9 h-9 flex items-center justify-center shadow-md hover:bg-primary hover:text-[#F7F4EE] hover:border-[#C1571F] transition-colors cursor-pointer lg:rounded-full"
        >
          <X size={16} />
        </button>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="overflow-y-auto flex-1 no-scrollbar"
        >
          {nodeOf(news.image && (
            <div className="relative w-full aspect-video shrink-0">
              <Image
                src={str(news.image) ?? ""}
                alt={str(news.heading || news.name || "") ?? ""}
                fill sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover"
                priority
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1815]/80 via-[#1B1815]/20 to-transparent" />
              <div className="absolute top-4 left-4 bg-primary text-[#F7F4EE] text-[10px] font-semibold tracking-widest px-2.5 py-1">
                DISPATCH {dispatchNo}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                {publishedDate && (
                  <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium mb-2">
                    <Calendar size={12} />
                    <span>{publishedDate}</span>
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold italic text-white leading-tight drop-shadow ">
                  {nodeOf(news.heading)}
                </h2>
              </div>
            </div>
          ))}

          {!news.image && (
            <div className="p-6 sm:p-8 pb-0">
              <div className="text-primary text-[10px] font-semibold tracking-widest mb-3">
                DISPATCH {dispatchNo}
              </div>
              {publishedDate && (
                <div className="flex items-center gap-1.5 text-[#8A8378] text-xs font-medium mb-3">
                  <Calendar size={12} />
                  <span>{publishedDate}</span>
                </div>
              )}
              <h2 className="text-xl sm:text-3xl font-semibold italic text-[#1B1815] leading-tight pr-12 ">
                {nodeOf(news.heading)}
              </h2>
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="w-10 h-[2px] bg-primary mb-6" />
            <div
              className="text-[#5A554C] text-sm sm:text-base leading-relaxed prose prose-sm max-w-none rendered-html"
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
              <div className="bg-[#1B1815] text-[#F7F4EE] px-4 py-2 text-[10px] font-semibold tracking-widest animate-bounce">
                SCROLL FOR MORE ↓
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ---------- card ---------- */

function NewsCard({ news: entry, index, onClick, totalCount }: NewsCardProps) {
  // `news.created_at` threw for a null item; fieldsOf keeps that.
  const news = fieldsOf(entry);
  const publishedDate = formatDate(news.created_at);
  const dispatchNo = String(Number(totalCount) - index).padStart(2, "0");

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={() => onClick(entry, index)}
      className="group cursor-pointer flex flex-col h-full bg-transparent transition-all duration-300"
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#E4DFD3] border border-[#D9D3C7]/40 rounded-xl lg:rounded-2xl">
        {news.image ? (
          <Image
            src={str(news.image) ?? ""}
            alt={str(news.heading || news.name || "") ?? ""}
            fill sizes="(max-width: 1023px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#8A8378]/40 font-serif italic text-xs">
            No Image
          </div>
        )}
        <div className="absolute top-3 left-3 bg-[#1B1815]/80 text-[#F7F4EE] text-[9px] font-semibold tracking-wider px-2 py-0.5">
          N° {dispatchNo}
        </div>
      </div>

      <div className="flex flex-col flex-1 pt-4 pb-2">
        {publishedDate && (
          <div className="flex items-center gap-1.5 text-[#8A8378] text-xs font-medium mb-1.5">
            <Calendar size={12} className="text-primary" />
            <span>{publishedDate}</span>
          </div>
        )}

        <h3 className="text-sm lg:text-lg font-semibold italic text-[#1B1815] group-hover:text-primary transition-colors duration-200 leading-snug line-clamp-2 mb-2 ">
          {nodeOf(news.heading)}
        </h3>

        <div
          className="text-[#5A554C] text-xs leading-relaxed line-clamp-2 mb-3 rendered-html"
          dangerouslySetInnerHTML={{ __html: formatHtml(news.description) }}
        />

        <div className="mt-auto pt-1 flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase">
          <span>Read Story</span>
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </div>
      </div>
    </motion.article>
  );
}

/* ---------- section ---------- */

export default function News({ newsData }: NewsProps) {
  const [selected, setSelected] = useState<unknown>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listLength = lengthOpt(newsData); // `newsData?.length`
  const isLoading = !newsData || listLength === 0;

  if (!listLength) {
    return (
      <div className="text-center py-20 text-[#8A8378]">No Blog Found</div>
    );
  }

  const handleSelect = (news: unknown, index: number) => {
    setSelected(news);
    setSelectedIndex(index);
  };

  return (
    <div className={`${switzer.variable} bg-transparent py-6 w-full`}>
      <div className="w-full">
        {/* Masthead */}
        <div className="flex items-end justify-between mb-4 w-full">
          <Title> Latest Stories</Title>
          <div className="hidden sm:block text-[#8A8378] text-xs tracking-wider tabular-nums">
            {String(listLength).padStart(2, "0")} DISPATCHES
          </div>
        </div>

        {/* Dynamic 2-column mobile to 4-column desktop seamless grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 w-full">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <NewsCardSkeleton key={i} />
              ))
            : mapList(newsData, (news, i) => (
                <NewsCard
                  key={keyFrom(fieldsOf(news).id || i)}
                  news={news}
                  index={i}
                  onClick={handleSelect}
                  totalCount={listLength}
                />
              ))}
        </div>
      </div>

      <AnimatePresence>
        {nodeOf(selected && (
          <Modal
            news={selected}
            index={selectedIndex}
            onClose={() => setSelected(null)}
            totalCount={listLength}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
