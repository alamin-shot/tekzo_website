import React from "react";
import type { NavHoverEffectProps } from "@/types/props/layout";
import ModalBox from "../NavItemsData/ModalBox";

// Not imported anywhere today (AUDIT_NOTES N14); converted as-is.
const NavHoverServer = ({ children, title, categories }: NavHoverEffectProps) => {
  // Render modal markup server-side so it's visible in the page source (view-source).
  // Keep the same classes used by the client variant so CSS/behavior remain unchanged.
  return (
    <div className="relative inline-block z-3000">
      {children}

      {/* Backdrop - server-rendered and hidden by default via classes */}
      <div className={`fixed inset-0 bg-black/10 transition-all duration-300 ease-in-out z-1000 backdrop-blur-none opacity-0 invisible pointer-events-none`} aria-hidden="true" />

      {/* Modal Container - server-rendered but hidden by default */}
      <div className={`fixed left-0 right-0 lg:bottom-3 xl:bottom-4.5 transition-all duration-300 z-1100 md:mx-5 lg:mx-7 xl:mx-10 opacity-0 translate-y-12 scale-90 invisible pointer-events-none`}>
        <div className="bg-white h-[50vh] border border-gray-100  rounded-[40px] overflow-auto w-full scrollbar">
          <div className="px-2 md:px-3 lg:px-[2%] xl:px-[3%] pt-8 text-center mb-4 lg:mb-6 xl:mb-8 md:mb-6">
            <ModalBox title={title} setIsHovered={() => {}} categories={categories}></ModalBox>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavHoverServer;
