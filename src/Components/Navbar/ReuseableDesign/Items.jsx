"use client";

import Image from "next/image";
import Link from "next/link";

const Items = ({ image, name, link, setIsHovered, setIsSidebarOpen }) => {
  const handleClose = () => {
    if (window.innerWidth >= 1024) {
      setIsHovered(false);
    } else {
      setIsSidebarOpen(false);
    }
  };

  return (
    <Link prefetch={false} href={`${link}`} className="inline-block" onClick={handleClose}>
      <div className="w-full rounded-2xl flex flex-col items-center justify-center gap-1.5 md:gap-3 group">
        <Image src={image || "/placeholder.jpg"} alt={name} width={120} height={120} className="w-12 h-12 xl:w-16 xl:h-16 group-hover:scale-105 transition-transform duration-200" />
        <p className="text-[10px] lg:text-xs xl:text-sm text-gray-700 whitespace-nowrap group-hover:scale-105 transition-transform duration-200">{name}</p>
      </div>
    </Link>
  );
};

export default Items;
