"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronRight } from "lucide-react";

/**
 * Collapsible description UI. Takes HTML that has ALREADY been passed through
 * formatHtml (sanitized). Server callers (e.g. the homepage) format on the
 * server so DOMPurify never ships to the browser; PageDescription formats on
 * the client for every other caller.
 *
 * @param {string} html - Pre-formatted, sanitized HTML.
 */
export default function PageDescriptionView({ title = "Learn More", html = "", className = "", defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState("0px");
  const contentRef = useRef(null);
  // Dynamically calculate height for a smooth Tailwind transition
  const updateHeight = useCallback(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isOpen]);

  useEffect(() => {
    updateHeight();
  }, [isOpen, html, updateHeight]);

  // Recalculate height on window resize when expanded
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      if (contentRef.current) {
        setContentHeight(`${contentRef.current.scrollHeight}px`);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  // Do not render anything if there is no description content
  if (!html) return null;

  return (
    <div className={`mt-3 lg:mt-6 mb-4 grow ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`w-full flex gap-2 lg:gap-3 items-center py-3 lg:py-4 text-sm lg:text-xl font-semibold text-gray-700 hover:text-primary cursor-pointer outline-none transition-colors duration-200 select-none group text-left ${
          isOpen ? "rounded-t-lg border-b-transparent" : "rounded-lg"
        }`}
      >
        <span className="leading-snug group-hover:text-primary transition-colors">{title}</span>
        <span className={`transform transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90 text-primary" : "rotate-0 text-gray-500 group-hover:text-primary"}`}>
          <ChevronRight size={22} className="stroke-[2.5]" />
        </span>
      </button>

      {/* Wrapper for smooth expand/collapse transition */}
      <div style={{ height: contentHeight }} className="overflow-hidden transition-[height] duration-300 ease-in-out">
        <div ref={contentRef} className="pb-2 pt-1">
          {/* Description Content Box - bg-dark and text-slate-800 */}
          <div className="p-5 md:p-10 bg-dark border border-gray-100 my-rounded shadow-sm">
            <div
              className="
                prose prose-slate max-w-none rendered-html text-slate-800 font-medium leading-relaxed
                prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-slate-900
                prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mb-6
                prose-h3:text-xl prose-h3:md:text-2xl prose-h3:text-primary
                prose-p:text-slate-800 prose-p:text-sm sm:prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed
                prose-strong:text-slate-900
                prose-li:text-slate-800
                prose-a:text-blue-600 hover:prose-a:text-blue-800
              "
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
