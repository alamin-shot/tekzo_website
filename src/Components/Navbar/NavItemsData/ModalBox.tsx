"use client";

import Link from "next/link";
import Image from "next/image";
import type { ModalBoxProps } from "@/types/props/layout";
import type { NavIconItem, NavImageItem } from "@/types/nav";
import { fieldsOf, mapOpt } from "@/lib/json";
import ItemMerge from "./ItemMerge";
import { Smartphone, DollarSign, ShoppingCart, BookOpen, HeartPulse, RefreshCw } from "lucide-react";

// React key from `item.id`: throws for a null item (as `item.id` did); a
// missing id gives an undefined key, as before. React stringifies keys anyway.
const keyOf = (item: unknown): string | undefined => {
  const id = fieldsOf(item).id;
  return id === undefined || id === null ? undefined : String(id);
};

const ModalBox = ({ title, categories, brands, setIsHovered }: ModalBoxProps) => {
  const companyProfile: NavImageItem[] = [
    { name: "About Us", image: "/logo/about-us-logo.svg", link: "/about-us" },
    {
      name: "Contact Us",
      image: "/logo/contact-logo.svg",
      link: "/contact-us",
    },
  ];

  const partners: NavImageItem[] = [
    {
      name: "B2B",
      image: "/icons/partners/b2b-base.svg",
      link: "/partners/b2b-register",
    },
    {
      name: "Dealership",
      image: "/icons/partners/dealer-base.svg",
      link: "/partners/become-a-dealer",
    },
    {
      name: "Retailer",
      image: "/icons/partners/retailer-base.svg",
      link: "/partners/retailer",
    },
    {
      name: "Franchise",
      image: "/icons/partners/franchise-base.svg",
      link: "/partners/franchise",
    },
    {
      name: "Corporate Order",
      image: "/icons/partners/retailer-base.svg",
      link: "/partners/corporate",
    },
  ];

  const usedDeviceOptions: NavIconItem[] = [
    { name: "Used Devices", icon: Smartphone, link: "/used-device" },
    {
      name: "Refurbished",
      icon: RefreshCw,
      link: "/refurbished",
    },
    { name: "Sell Your Device", icon: DollarSign, link: "/sell-your-device" },
    {
      name: "Marketplace",
      icon: ShoppingCart,
      link: "/marketplace",
    },
  ];

  const discoveryOptions: NavIconItem[] = [
    { name: "About Us", icon: Smartphone, link: "/about-us" },
    { name: "Contact Us", icon: ShoppingCart, link: "/contact-us" },
    { name: "Blog", icon: BookOpen, link: "/blog" },
    { name: "Tekzo Care", icon: HeartPulse, link: "/tekzo-care" },
  ];

  return (
    <div>
      {(title === "company profile" || title === "categories") && (
        <div className="grid grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-y-12 pb-10 ">
          {/* Categories */}
          {title === "categories" &&
            mapOpt(categories, (item) => (
              <div key={keyOf(item)} className="" onClick={() => setIsHovered(false)}>
                {/* <ItemMergeCategory item={item}></ItemMergeCategory> */}
                <ItemMerge item={item} name={"categories"}></ItemMerge>
              </div>
            ))}

          {/* Company Profile */}
          {title === "company profile" &&
            companyProfile.map((item, index) => (
              <Link prefetch={false} key={index} href={item.link} className="flex flex-col items-center group" onClick={() => setIsHovered(false)}>
                <Image src={item.image} alt={item.name} width={80} height={80} className="w-15 h-15 group-hover:scale-105 transition-transform duration-200" />
                <span className="mt-2 text-sm group-hover:scale-105 transition-transform duration-200">{item.name}</span>
              </Link>
            ))}
        </div>
      )}

      {/* Brands */}
      <div className="grid grid-cols-6 ">
        {title === "brand" &&
          mapOpt(brands, (item) => (
            <div key={keyOf(item)} onClick={() => setIsHovered(false)}>
              <ItemMerge item={item} name={"brand"}></ItemMerge>
            </div>
          ))}
        {title === "partners" &&
          partners.map((item, index) => (
            <Link prefetch={false} key={index} href={item.link} className="flex flex-col items-center group" onClick={() => setIsHovered(false)}>
              <Image src={item.image} alt={item.name} width={80} height={80} className="w-15 h-15 group-hover:scale-105 transition-transform duration-200" />
              <span className="mt-2 text-sm group-hover:scale-105 transition-transform duration-200">{item.name}</span>
            </Link>
          ))}
      </div>

      {/* Used Device Options */}
      {title === "usedDevice" && (
        <div className="flex flex-wrap items-start justify-start gap-4 sm:gap-6">
          {usedDeviceOptions.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                prefetch={false}
                key={index}
                href={item.link}
                onClick={() => setIsHovered(false)}
                className="group flex flex-col items-center justify-center w-36 sm:w-40 p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Icon Container with subtle glass effect */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl bg-slate-100/70 group-hover:bg-[#ee8045]/10 text-slate-700 group-hover:text-[#ee8045] group-hover:scale-105 transition-all duration-300">
                  <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
                </div>

                {/* Label */}
                <span className="mt-3 text-sm sm:text-base font-semibold text-slate-800 group-hover:text-[#ee8045] transition-colors duration-300 text-center tracking-tight whitespace-nowrap">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Discovery Options */}
      {title === "discovery" && (
        <div className="flex flex-wrap items-start justify-start gap-4 sm:gap-6">
          {discoveryOptions.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                prefetch={false}
                key={index}
                href={item.link}
                onClick={() => setIsHovered(false)}
                className="group flex flex-col items-center justify-center w-36 sm:w-40 p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Icon Container with subtle glass effect */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl bg-slate-100/70 group-hover:bg-[#ee8045]/10 text-slate-700 group-hover:text-[#ee8045] group-hover:scale-105 transition-all duration-300">
                  <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
                </div>

                {/* Label */}
                <span className="mt-3 text-sm sm:text-base font-semibold text-slate-800 group-hover:text-[#ee8045] transition-colors duration-300 text-center tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModalBox;
