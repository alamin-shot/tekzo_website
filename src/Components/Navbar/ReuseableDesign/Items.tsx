"use client";

import Image from "next/image";
import Link from "next/link";
import type { NavItemTileProps } from "@/types/props/layout";
import { nodeOf, str } from "@/lib/render";

const Items = ({ image, name, link, setIsHovered, setIsSidebarOpen }: NavItemTileProps) => {
  const handleClose = () => {
    // Desktop closes the hover menu, mobile the sidebar.
    // AUDIT_NOTES N13 (preserved): the mobile sidebar passes no setIsHovered,
    // so on a ≥1024px viewport this throws, exactly as the JS did.
    if (window.innerWidth >= 1024) {
      if (!setIsHovered) throw new TypeError("setIsHovered is not a function");
      setIsHovered(false);
    } else {
      if (!setIsSidebarOpen) throw new TypeError("setIsSidebarOpen is not a function");
      setIsSidebarOpen(false);
    }
  };

  return (
    <Link prefetch={false} href={`${link}`} className="inline-block" onClick={handleClose}>
      <div className="w-full rounded-2xl flex flex-col items-center justify-center gap-1.5 md:gap-3 group">
        <Image src={str(image) || "/placeholder.jpg"} alt={str(name) ?? ""} width={120} height={120} className="w-12 h-12 xl:w-16 xl:h-16 group-hover:scale-105 transition-transform duration-200" />
        <p className="text-[10px] lg:text-xs xl:text-sm text-gray-700 whitespace-nowrap group-hover:scale-105 transition-transform duration-200">{nodeOf(name)}</p>
      </div>
    </Link>
  );
};

export default Items;
