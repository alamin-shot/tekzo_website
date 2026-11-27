"use client";
import type { SearchModalOverlayProps } from "@/types/search";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModalContent from "../SearchModal/ModalContent";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";

// Split out from Banner so framer-motion + the search results UI (and their
// own data fetching) only ship to the client once the modal actually opens,
// instead of bloating every page's initial JS bundle.
export default function SearchModalOverlay({
  isModalOpen,
  setIsModalOpen,
  searchQuery,
  searchResults,
  isLoading,
  searchError,
  micRef, clearBtnRef, inputRef,
}: SearchModalOverlayProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      // `contains(e.target)`: event targets here are DOM nodes.
      const target = e.target instanceof Node ? e.target : null;
      if (micRef?.current?.contains(target)) return;
      if (clearBtnRef?.current?.contains(target)) return;
      if (
        modalRef.current &&
        !modalRef.current.contains(target) &&
        inputRef?.current &&
        !inputRef.current.contains(target)
      ) {
        setIsModalOpen(false);
      }
    };

    // Pause page videos (hero banner, reels) hidden behind the modal so iOS
    // isn't decoding them while the keyboard opens — that memory spike is
    // what made Chrome on iPhone kill the tab. Resumed on close.
    const pausedVideos: HTMLVideoElement[] = [];
    document.querySelectorAll("video").forEach((video) => {
      if (modalRef.current?.contains(video) || video.paused) return;
      video.pause();
      pausedVideos.push(video);
    });

    lockScroll();
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      unlockScroll();
      pausedVideos.forEach((video) => video.play().catch(() => {}));
    };
  }, [isModalOpen, micRef, clearBtnRef, inputRef, setIsModalOpen]);

  return (
    <>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/50 lg:backdrop-blur-sm z-[2800] pointer-events-auto touch-none overscroll-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed lg:absolute top-0 left-0 right-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 w-screen lg:w-[80%] h-screen lg:h-[calc(94vh-40px)] bg-dark lg:shadow-2xl lg:rounded-[50px] z-[2900] overflow-hidden flex flex-col overscroll-contain"
          >
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-dark mt-17 lg:mt-17 mb-[150px] lg:mb-6 overscroll-contain">
              <div className="px-4 lg:px-6">
                <ModalContent
                  searchQuery={searchQuery}
                  searchResults={searchResults}
                  isLoading={isLoading}
                  searchError={searchError}
                  setIsModalOpen={setIsModalOpen}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
