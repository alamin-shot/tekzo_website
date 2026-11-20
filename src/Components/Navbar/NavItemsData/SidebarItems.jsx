import React from "react";
import Items from "../ReuseableDesign/Items";
import Image from "next/image";
import AllPage from "../NavFunction/AllPage";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import { Smartphone, BookOpen, HeartPulse, InfoIcon, MailIcon, Store, BadgeDollarSign, Earth, RefreshCw } from "lucide-react";

const SidebarItems = ({ title, setIsSidebarOpen, categories, brands }) => {
  const marketplaceOptions = [
    { name: "Used Devices", icon: Smartphone, link: "/used-device" },
    {
      name: "Sell Your Device",
      icon: BadgeDollarSign,
      link: "/sell-your-device",
    },
    {
      name: "Marketplace",
      icon: Store,
      link: "/marketplace",
    },
    {
      name: "Refurbished",
      icon: RefreshCw,
      link: "/refurbished",
    },
  ];

  const discoveryOptions = [
    { name: "discovery", icon: Earth, link: "/discovery" },
    { name: "About Us", icon: InfoIcon, link: "/about-us" },
    {
      name: "Contact Us",
      icon: MailIcon,
      link: "/contact-us",
    },
    { name: "Blog", icon: BookOpen, link: "/blog" },
    { name: "Tekzo Care", icon: HeartPulse, link: "/tekzo-care" },
  ];

  return (
    <div className="-mb-5">
      {/* Categories */}
      {title === "categories" && (
        <div className="">
          <div className="grid grid-cols-3 gap-y-6 max-h-[300px] overflow-y-auto custom-scrollbar px-2">
            {categories?.map((item) => (
              <div key={item?.id} className="flex-center z-1000">
                <Items link={`/categories/${item?.slug?.toLowerCase()}`} image={item?.logo} name={item?.name} setIsSidebarOpen={setIsSidebarOpen}></Items>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <AllPage link={"/categories"} title={"All Categories"} setIsSidebarOpen={setIsSidebarOpen}></AllPage>
          </div>
        </div>
      )}

      {/* Brands*/}
      {title === "brand" && (
        <div className="">
          <div className="grid grid-cols-3 gap-y-7 justify-items-center max-h-[300px] overflow-y-auto custom-scrollbar px-2">
            {brands?.map((item) => (
              <div key={item?.id}>
                <PreFetchLink prefetch={false} href={`/brands/${item?.slug?.toLowerCase()}` || "/"} onClick={() => setIsSidebarOpen(false)} className="inline-block flex-center ">
                  <div className="w-18 h-18  rounded-2xl flex flex-col items-center justify-center gap-1.5 md:gap-3 group">
                    <Image src={item?.primary_logo} alt={item?.name} width={120} height={120} className="group-hover:scale-105 transition-transform duration-200" />
                  </div>
                </PreFetchLink>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <AllPage link={"/brands"} title={"All Brands"} setIsSidebarOpen={setIsSidebarOpen}></AllPage>
          </div>
        </div>
      )}

      {/* Marketplace Options */}
      {title === "marketplace" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-1">
          {marketplaceOptions.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <PreFetchLink
                prefetch={false}
                key={index}
                href={item.link}
                onClick={() => setIsSidebarOpen(false)}
                className="flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors p-3 rounded-2xl"
              >
                {/* Icon Container */}
                <div className="w-16 h-14 flex items-center justify-center text-slate-700 group-hover:text-[#ee8045] transition-colors duration-300">
                  <IconComponent className="w-11 h-11" strokeWidth={1.5} />
                </div>

                {/* Label */}
                <p className="text-center capitalize font-light text-sm px-2 leading-tight">{item.name}</p>
              </PreFetchLink>
            );
          })}
        </div>
      )}

      {/* Discovery Options */}
      {title === "discovery" && (
        <div className="grid grid-cols-3 gap-4 px-1">
          {discoveryOptions.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <PreFetchLink
                prefetch={false}
                key={index}
                href={item.link}
                onClick={() => setIsSidebarOpen(false)}
                className="flex flex-col items-center justify-center gap-3 aspect-square  rounded-3xl cursor-pointer transition-colors"
              >
                <div className="w-16 h-14 flex items-center justify-center text-slate-700 group-hover:text-[#ee8045] transition-colors duration-300">
                  <IconComponent className="w-11 h-11" strokeWidth={1.5} />
                </div>

                {/* Label */}
                <p className="text-center capitalize font-light text-sm px-2 leading-tight">{item.name}</p>
              </PreFetchLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarItems;
