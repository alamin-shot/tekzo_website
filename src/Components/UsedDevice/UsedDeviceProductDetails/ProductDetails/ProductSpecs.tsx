"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { OpenSectionMap, ProductSpecsProps } from "@/types/props/product";
import { fieldsOf, mapList, mapOpt } from "@/lib/json";
import { idKey, keyFrom, nodeOf } from "@/lib/render";

// `section.name` / `item.id` — throw for a null entry, as before.
const nameKey = (section: unknown): string => String(fieldsOf(section).name);

const ProductSpecs = ({ productSpecs }: ProductSpecsProps) => {
  // Use productSpecs if available, otherwise fallback to empty array
  const data = productSpecs || [];

  // Initialize state by creating an object where every section name is a key set to true
  const [openSections, setOpenSections] = useState<OpenSectionMap>(() => {
    if (!productSpecs) return {};
    return Object.fromEntries(
      mapList(productSpecs, (section) => [nameKey(section), true]),
    );
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="space-y-4 font-sans text-gray-800">
      {mapList(data, (entry) => {
        // Use section.name from your JSON structure
        const section = fieldsOf(entry);
        const isOpen = !!openSections[nameKey(entry)];

        return (
          <div
            key={idKey(entry)}
            className="bg-dark rounded-2xl lg:rounded-4xl overflow-hidden shadow-sm border border-gray-200"
          >
            {/* Accordion Header */}
            <button
              onClick={() => toggleSection(nameKey(entry))}
              className="w-full flex items-center justify-between p-4 lg:px-8 text-left  focus:outline-none cursor-auto"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-base lg:text-lg text-gray-700 ">
                {nodeOf(section.name)}
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
                        {mapOpt(section.group_values, (item, idx) => (
                          <tr
                            key={`${String(section.id)}-${String(fieldsOf(item).id || idx)}`}
                            className="border-b border-gray-300 last:border-0"
                          >
                            {nodeOf(fieldsOf(item).details && (
                              <>
                                <td className="w-[35%] lg:w-[25%] py-4 text-xs lg:text-sm font-semibold text-gray-700 align-top uppercase tracking-wider">
                                  {nodeOf(fieldsOf(item).name)}
                                </td>
                                <td className="w-[65%] lg:w-[75%] py-4 text-xs lg:text-sm text-gray-800 leading-relaxed ">
                                  {nodeOf(fieldsOf(item).details)}
                                </td>
                              </>
                            ))}
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
