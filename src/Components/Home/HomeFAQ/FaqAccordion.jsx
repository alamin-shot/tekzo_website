"use client";

import { createContext, useContext, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

// Client half of the homepage FAQ. HomeFAQ (a server component) renders the
// questions and answers; only the single-open accordion state and the card
// chrome below ship as JS. Answers arrive as server-rendered `children`, so
// their copy is not part of the client bundle. Markup/classes are unchanged
// from the previous all-client HomeFAQ.
const FaqOpenContext = createContext(null);

export function FaqAccordion({ children }) {
  const [openIndex, setOpenIndex] = useState(null);
  return <FaqOpenContext.Provider value={{ openIndex, setOpenIndex }}>{children}</FaqOpenContext.Provider>;
}

export function FaqCard({ index, question, children }) {
  const { openIndex, setOpenIndex } = useContext(FaqOpenContext);
  const isOpen = openIndex === index;

  const toggleAccordion = () => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div
      className={`rounded-2xl md:rounded-3xl transition-[box-shadow,border-color] duration-300 bg-gradient-to-br from-secondary/20 to-secondary/5  ${
        isOpen ? "border-secondary/40 shadow-md ring-1 ring-secondary/25" : "border-secondary/20 hover:border-secondary/35 shadow-xs hover:shadow-md"
      }`}
    >
      <h3 className="m-0">
      <button
        type="button"
        onClick={toggleAccordion}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-trigger-${index}`}
        className="w-full flex items-start justify-between gap-3 p-4 md:p-5 text-left cursor-pointer group select-none transition-colors rounded-2xl md:rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-[transform,background-color,color,box-shadow] duration-300 ${
              isOpen ? "bg-secondary text-white shadow-sm" : "bg-white/80 text-secondary shadow-xs group-hover:bg-white group-hover:scale-105"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </span>
          <span className={`text-sm md:text-base font-bold leading-snug transition-colors ${isOpen ? "text-secondary" : "text-gray-900 group-hover:text-secondary"}`}>{question}</span>
        </div>
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-1 transition-[transform,background-color,color,box-shadow] duration-300 ${
            isOpen ? "bg-secondary text-white rotate-180 shadow-xs" : "bg-white/70 text-gray-500 group-hover:text-secondary group-hover:bg-white rotate-0 shadow-xs"
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>
      </h3>

      {/* Smooth CSS Grid Transition */}
      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-trigger-${index}`}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 md:px-5 pb-5 pt-2 text-xs md:text-sm text-gray-700 leading-relaxed border-t border-secondary/15">{children}</div>
        </div>
      </div>
    </div>
  );
}
