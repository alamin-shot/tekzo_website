"use client";

import Image from "next/image";
import { useState } from "react";
import type { SidebarItemsProps } from "@/types/props/layout";
import type { NavMenuTitle, SidebarButtonItem } from "@/types/nav";
import ExpandableContent from "./ExpandableContent";
import SidebarItemsData from "../NavItemsData/SidebarItems";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";

const SidebarItems = ({ setIsSidebarOpen, categories, brands }: SidebarItemsProps) => {
  const [openedItem, setOpenedItem] = useState<NavMenuTitle | null>(null);

  const allItems: SidebarButtonItem[] = [
    {
      title: "categories",
      image: "/sidebar-icons/shop.png",
      isExpandable: true,
    },
    { title: "brand", image: "/sidebar-icons/brand.png", isExpandable: true },
    {
      title: "marketplace",
      image: "/sidebar-icons/used-device.png",
      isExpandable: true,
    },
    {
      title: "offers",
      image: "/sidebar-icons/offers.png",
      link: "/shop/offer",
    },
    { title: "compare", image: "/sidebar-icons/compare.png", link: "/compare" },
    {
      title: "wishlist",
      image: "/sidebar-icons/wishlist.png",
      link: "/dashboard/wishlist",
    },
    {
      title: "cart",
      image: "/sidebar-icons/shop.png",
      link: "/dashboard/my-bag",
    },
    // {
    //   title: "gift cards",
    //   image: "/sidebar-icons/wishlist.png",
    //   link: "/gift-cards",
    // },
    {
      title: "discovery",
      image: "/sidebar-icons/company-profile.png",
      isExpandable: true,
    },
  ];

  const handleToggle = (title: NavMenuTitle) => {
    setOpenedItem(openedItem === title ? null : title);
  };

  const renderButton = (item: SidebarButtonItem) => {
    const buttonContent = (
      <div className="flex flex-col items-center justify-center gap-3 aspect-square bg-[#f0f0f0] rounded-3xl cursor-pointer hover:bg-gray-200 transition-colors w-full">
        <div className="relative">
          <div className="w-20 h-16 relative ">
            <Image src={item.image} alt={item.title} fill sizes="80px" className="object-contain" />
          </div>
          {item.title === "wishlist" && (
            <span className="absolute -top-1 -right-2 h-5 w-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">0</span>
          )}
        </div>
        <p className="whitespace-nowrap capitalize font-light text-sm">{item.title}</p>
      </div>
    );

    if (item.isExpandable) {
      return (
        <ExpandableContent key={item.title} title={item.title} onToggle={handleToggle} isOpen={openedItem === item.title}>
          {buttonContent}
        </ExpandableContent>
      );
    }

    return (
      <PreFetchLink prefetch={false} key={item.title} href={item.link || "#"} onClick={() => setIsSidebarOpen(false)}>
        {buttonContent}
      </PreFetchLink>
    );
  };

  return (
    /* h-full and overflow-y-auto ensures scrolling works for all 8 items */
    <div className="relative h-full w-full overflow-y-auto pb-24 custom-scrollbar">
      {/* First row: Category and Brand */}
      <div className="grid grid-cols-2 gap-4 px-1">{allItems.slice(0, 2).map((item) => renderButton(item))}</div>

      {/* Expanded content - appears right after Category and Brand */}
      {openedItem && (
        <div className="mt-4 w-full overflow-hidden transition-all duration-500 ease-in-out">
          <div className="py-4 rounded-3xl bg-[#f0f0f0] border border-orange-700/15 overflow-x-hidden">
            <div className="w-full">
              <SidebarItemsData title={openedItem} setIsSidebarOpen={setIsSidebarOpen} categories={categories} brands={brands} />
            </div>
          </div>
        </div>
      )}

      {/* Rest of the items */}
      <div className="grid grid-cols-2 gap-4 px-1 mt-4">{allItems.slice(2).map((item) => renderButton(item))}</div>
    </div>
  );
};

export default SidebarItems;
