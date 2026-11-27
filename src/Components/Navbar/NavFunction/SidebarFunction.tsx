"use client";

import React, { useState, useRef, useEffect } from "react";
import type { TouchEvent } from "react";
import type { SidebarFunctionProps } from "@/types/props/layout";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import { createPortal } from "react-dom";
import { RxCross1 } from "react-icons/rx";
import Image from "next/image";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import fetchPublicAPI from "@/utils/fetchPublicAPI";
import { lengthOf, rec } from "@/lib/json";
import { str } from "@/lib/render";
import SidebarItems from "./SidebarItems";

// `x?.length` for an API value (undefined for nullish values).
const lengthOpt = (value: unknown): unknown => (value === null || value === undefined ? undefined : lengthOf(value));

const SidebarFunction = ({ children, categories, brands, companySetting }: SidebarFunctionProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState<unknown>([]);
  const [fetchedBrands, setFetchedBrands] = useState<unknown>([]);

  const fetchedCategoriesLength = lengthOpt(fetchedCategories);
  const fetchedBrandsLength = lengthOpt(fetchedBrands);

  useEffect(() => {
    if (!isSidebarOpen) return;
    if ((!categories || !lengthOpt(categories)) && !fetchedCategoriesLength) {
      fetchPublicAPI("/categories")
        .then((res) => {
          const data = rec(res)?.data;
          if (data) setFetchedCategories(data);
        })
        .catch(() => {});
    }
    if ((!brands || !lengthOpt(brands)) && !fetchedBrandsLength) {
      fetchPublicAPI("/brands")
        .then((res) => {
          const data = rec(res)?.data;
          if (data) setFetchedBrands(data);
        })
        .catch(() => {});
    }
  }, [isSidebarOpen, categories, brands, fetchedCategoriesLength, fetchedBrandsLength]);

  const activeCategories = lengthOpt(categories) ? categories : fetchedCategories;
  const activeBrands = lengthOpt(brands) ? brands : fetchedBrands;

  // Ref to store the starting X position of a touch
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      setRenderContent(true);
    } else {
      const timer = setTimeout(() => setRenderContent(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  // Tied to the open state rather than the open/close handlers: tapping a link
  // inside the sidebar navigates away and unmounts this component without
  // either handler running, so an imperative unlockScroll() there gets skipped
  // and html/body keep `overflow: hidden` — leaving the next page completely
  // unscrollable. An effect cleanup always runs, including on unmount.
  useEffect(() => {
    if (!isSidebarOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen((open) => !open);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // --- SWIPE LOGIC ---
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    // Record where the touch started
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const touchCurrentX = e.targetTouches[0].clientX;
    const distance = touchStartX.current - touchCurrentX;

    // If the user swipes from right to left by more than 50px
    if (distance > 50) {
      closeSidebar();
      // Reset the ref so it doesn't trigger multiple times per swipe
      touchStartX.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  const cs = rec(companySetting);

  const sidebarContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-[9998] ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeSidebar}
      />

      {/* Sidebar Panel */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={` fixed top-0 left-0 h-screen w-screen bg-white shadow-2xl z-[9999] transform transition-transform duration-500 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header with TEKZO Logo and Close Button */}
          <div className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-100 bg-white">
            {/* TEKZO Logo */}
            <PreFetchLink href="/" onClick={closeSidebar} className="relative flex items-center w-28 sm:w-36">
              <Image
                src={str(cs?.company_logo) || "/nav-logo.png"}
                alt={str(cs?.company_name) || "TEKZO"}
                width={180}
                height={60}
                className="w-full h-auto object-contain"
                priority
              />
            </PreFetchLink>

            {/* Close Button */}
            <button
              onClick={closeSidebar}
              className="p-2.5 sm:p-3 bg-gray-100 rounded-full text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <RxCross1 size={22} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 scroll-smooth no-scrollbar">
            {renderContent && <SidebarItems setIsSidebarOpen={setIsSidebarOpen} categories={activeCategories} brands={activeBrands} />}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div onClick={toggleSidebar} className="cursor-pointer">
        {children}
      </div>
      {mounted && createPortal(sidebarContent, document.body)}
    </>
  );
};

export default SidebarFunction;
