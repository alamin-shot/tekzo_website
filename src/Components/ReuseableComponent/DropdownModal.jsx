"use client";

import React, { useState, useRef, useEffect } from "react";
import PriceRangeFilter from "../Shop/PriceRangeFilter";

export default function DropdownModal({ title }) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(650000);

  //! demo test item
  const items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"];

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="">
      <div className="relative lg:inline-block" ref={modalRef}>
        {/* Trigger Button - Consistent Text */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-2.5 bg-dark text-base lg:text-lg text-secondary rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          {/* {title == "Price" ? title , <span></span> : title} */}
          {title}
          {/* {title === "Price" && maxPrice !== maxPrice && (
            <span>
              {" "}
              {minPrice} - {maxPrice}
            </span>
          )} */}
        </button>

        <div
          className={`
            absolute left-0 mt-2 ${title == "Default" || title == "Availability" ? "left-auto right-0 lg:left-0 lg:right-auto" : ""} ${title == "Price" ? "w-65" : "w-55"} bg-white rounded-xl shadow-2xl z-50 overflow-hidden
            transition-all duration-200 ease-out origin-top-left
            ${isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
          `}
        >
          {title === "Price" ? (
            <PriceRangeFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
            ></PriceRangeFilter>
          ) : (
            <div className="p-3 flex flex-col overflow-auto h-75 scrollbar">
              {items.map((item, index) => (
                <span
                  key={index}
                  className="p-2 px-3 text-gray-700 font-light rounded-lg hover:bg-gray-100 cursor-pointer border-[0.5px] border-transparent active:border-secondary/50 duration-300 "
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
