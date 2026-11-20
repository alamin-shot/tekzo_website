"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useProductSearch } from "@/hooks/useProductSearch";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import MicButton from "./SearchBarParts/MicButton";
import SearchBarAction from "./SearchBarParts/SearchBarAction";
import SearchInput from "./SearchBarParts/SearchInput";

// framer-motion + the search results UI only ship to the client once the
// modal actually opens, instead of bloating every page's initial JS bundle
const SearchModalOverlay = dynamic(() => import("./SearchModalOverlay"), {
  ssr: false,
});

const SearchBar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Once true, stays true: keeps SearchModalOverlay (and framer-motion) out of
  // the bundle until first interaction, but mounted afterwards so its own
  // AnimatePresence can still play the close animation.
  const [hasOpenedSearch, setHasOpenedSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isModalOpen) setHasOpenedSearch(true);
  }, [isModalOpen]);

  const inputRef = useRef(null);
  const micRef = useRef(null);
  const clearBtnRef = useRef(null);

  const { results, isLoading, error } = useProductSearch(searchQuery);
  const { isListening, toggleListening } = useVoiceSearch((transcript) => {
    setSearchQuery(transcript);
    setIsModalOpen(true);
  });

  const micProps = { isListening, onClick: toggleListening, micRef };

  return (
    <>
      {hasOpenedSearch && (
        <SearchModalOverlay
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          searchQuery={searchQuery}
          searchResults={results}
          isLoading={isLoading}
          searchError={error}
          micRef={micRef}
          clearBtnRef={clearBtnRef}
          inputRef={inputRef}
        />
      )}

      <div
        className={`${isModalOpen ? "fixed top-0 right-0 left-0 p-3 lg:p-0 lg:absolute z-[2950]" : "lg:absolute top-0 right-0 left-0 z-[999]"}`}
      >
        <div className="flex justify-between mb-3 lg:mb-0 gap-2 lg:relative lg:px-0 ">
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative lg:flex lg:justify-center w-full items-stretch lg:bg-[url('/search-bar-bg.svg')] bg-no-repeat bg-position-[center_top] lg:h-8 xl:h-10 2xl:h-12 lg:bg-[length:50%_auto] ${isModalOpen ? "z-[2950]" : "z-[999]"}`}
          >
            {/* Mobile Mic */}
            <MicButton {...micProps} className="absolute left-3 top-1/2 -translate-y-1/2 z-[200] flex items-center justify-center w-7 h-7 lg:hidden" />

            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onFocus={() => setIsModalOpen(true)}
              isModalOpen={isModalOpen}
              isListening={isListening}
              inputRef={inputRef}
              clearBtnRef={clearBtnRef}
            />

            {/* Desktop Mic */}
            <MicButton {...micProps} className="hidden lg:flex absolute top-1/2 -translate-y-1/2 ml-[41%] items-center justify-center z-[200]" />
          </div>

          <SearchBarAction
            isModalOpen={isModalOpen}
            onClose={() => {
              setSearchQuery("");
              setIsModalOpen(false);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default SearchBar;
