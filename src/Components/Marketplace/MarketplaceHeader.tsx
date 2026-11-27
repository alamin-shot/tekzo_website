"use client";

import { MdVerified } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Banknote, Sparkles } from "lucide-react";
import { BiMobile } from "react-icons/bi";

export default function MarketplaceHeader() {
  const pathname = usePathname();

  const links = [
    {
      label: "All Used Devices",
      href: "/used-device",
      icon: ShoppingCart, // Pass the component directly
    },
    {
      label: "Sell Your Device",
      href: "/sell-your-device",
      icon: Banknote,
    },
    {
      label: "All New Devices",
      href: "/categories/electronic-devices", // Fixed path from duplicate /sell-your-device
      icon: Sparkles,
    },
    {
      label: "All Refurbished Devices",
      href: "/refurbished", // Fixed path from duplicate /sell-your-device
      icon: BiMobile,
    },
  ];

  return (
    <div className="mb-6 lg:mb-8">
      {/* Header Section with Logo, Title & Links */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
        {/* Logo & Title Section */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Logo */}
          <div className="w-16 h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
            <Image src="/sidebar-icons/shop.png" alt="TEKZO Marketplace" width={60} height={60} className="object-contain w-full" />
          </div>

          {/* Title */}
          <div className="">
            <div className="flex items-center gap-2">
              <div className="inline-flex relative group">
                <div className="absolute -inset-0.5 group-hover:opacity-50 transition duration-500"></div>
                <h1 className="relative text-xl md:text-2xl lg:text-3xl font-black  flex items-center gap-2">
                  <span className="text-gray-800 tracking-wide">TEKZO</span>
                  <span className="text-secondary font-medium tracking-normal">Marketplace</span>
                </h1>
              </div>
              <MdVerified className="shrink-0 text-lg text-blue-500 lg:text-xl" aria-label="Verified" />
            </div>
            <p className="mt-1 text-gray-600">Buy / Sell / Exchange</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 lg:ml-auto">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-medium rounded-full transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-secondary text-white shadow-md hover:bg-secondary/90"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-secondary hover:text-secondary hover:shadow-sm"
                }`}
              >
                <IconComponent className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
