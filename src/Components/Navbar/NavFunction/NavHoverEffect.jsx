"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import ModalBox from "../NavItemsData/ModalBox";

const NavHoverEffect = ({ children, title, categories, brands }) => {
  const [isHovered, setIsHovered] = useState(false);
  // Mobile never hovers this menu (it uses SidebarFunction instead), so
  // deferring the mount until first hover keeps the mega-menu's markup/images
  // out of mobile hydration entirely instead of just CSS-hiding it.
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const timeoutRef = useRef(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
    setHasOpenedOnce(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  const handleClose = () => {
    setIsHovered(false);
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/10 transition-all duration-300 ease-in-out z-1000 
              ${isHovered ? "backdrop-blur-xs opacity-100 visible" : "backdrop-blur-none opacity-0 invisible pointer-events-none"}`}
        onClick={() => setIsHovered(false)}
      />

      {/* Modal Container */}
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={`fixed left-0 right-0 lg:bottom-3 xl:bottom-4.5 transition-all duration-300 z-1100 md:mx-5 lg:mx-7 xl:mx-10
              ${isHovered ? "opacity-100 translate-y-0 scale-100 visible pointer-events-auto" : "opacity-0 translate-y-12 scale-90 invisible pointer-events-none"}`}
      >
        {/* Modal Box with  */}
        <div className="bg-gray-50 h-[50vh] border border-gray-100  rounded-[40px] overflow-auto w-full scrollbar mb-0.5">
          <div className="px-2 md:px-3 lg:px-[2%] xl:px-[3%] pt-8 text-center mb-4 lg:mb-6 xl:mb-8 md:mb-6">
            <ModalBox
              title={title}
              setIsHovered={setIsHovered}
              categories={categories}
              brands={brands}
            ></ModalBox>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div
        className="relative inline-block cursor-pointer z-3000"
        onClick={handleClose}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {children}
      </div>

      {hasOpenedOnce && typeof document !== "undefined"
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
};

export default NavHoverEffect;
