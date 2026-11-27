"use client";

import React, { useRef } from "react";
import type { ExpandableContentProps } from "@/types/props/layout";

const ExpandableContent = ({ children, title, onToggle, isOpen }: ExpandableContentProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    onToggle(title);
  };

  return (
    <div
      ref={triggerRef}
      onClick={toggleOpen}
      className={`w-full transition-all cursor-pointer rounded-3xl aspect-square flex flex-col items-center justify-center gap-3 ${isOpen ? "border-1 border-orange-200 text-primary" : "bg-[#f0f0f0]"} hover:bg-gray-200`}
    >
      {children}
    </div>
  );
};

export default ExpandableContent;
