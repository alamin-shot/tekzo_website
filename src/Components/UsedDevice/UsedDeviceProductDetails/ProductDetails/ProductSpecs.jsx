"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProductSpecs = ({ productSpecs }) => {
  // Use productSpecs if available, otherwise fallback to empty array
  const data = productSpecs || [];

  // Initialize state by creating an object where every section name is a key set to true
  const [openSections, setOpenSections] = useState(() => {
    if (!productSpecs) return {};
    return Object.fromEntries(
      productSpecs.map((section) => [section.name, true]),
    );
  });

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="space-y-4 font-sans text-gray-800">
      {data.map((section) => {
        // Use section.name from your JSON structure
        const isOpen = !!openSections[section.name];

        return (
          <div
            key={section.id}
            className="bg-dark rounded-2xl lg:rounded-4xl overflow-hidden shadow-sm border border-gray-200"
          >
            {/* Accordion Header */}
            <button
              onClick={() => toggleSection(section.name)}
              className="w-full flex items-center justify-between p-4 lg:px-8 text-left  focus:outline-none cursor-auto"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-base lg:text-lg text-gray-700 ">
                {section.name}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="bg-[#E7E9EB] px-4 lg:px-8 pb-4">
                    <table className="w-full border-collapse">
                      <tbody>
                        {/* Map through group_values from your JSON structure */}
                        {section.group_values?.map((item, idx) => (
                          <tr
                            key={`${section.id}-${item.id || idx}`}
                            className="border-b border-gray-300 last:border-0"
                          >
                            {item.details && (
                              <>
                                <td className="w-[35%] lg:w-[25%] py-4 text-xs lg:text-sm font-semibold text-gray-700 align-top uppercase tracking-wider">
                                  {item.name}
                                </td>
                                <td className="w-[65%] lg:w-[75%] py-4 text-xs lg:text-sm text-gray-800 leading-relaxed ">
                                  {item.details}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default ProductSpecs;
