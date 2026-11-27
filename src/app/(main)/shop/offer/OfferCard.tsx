"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";
import type { CountdownParts, OfferCardItemProps, OfferCardProps, TimeUnitProps } from "@/types/props/offer";
import { fieldsOf, mapList, toDateInput } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

function useCountdown(endAt: unknown): CountdownParts {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // `new Date(endAt) - Date.now()` (Date subtraction uses getTime())
    const getRemaining = () =>
      Math.max(0, Math.floor((new Date(toDateInput(endAt)).getTime() - Date.now()) / 1000));
    setTotal(getRemaining());
    const id = setInterval(() => setTotal((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [endAt]);

  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    mins: Math.floor((total % 3600) / 60),
    secs: total % 60,
  };
}

function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      {/* Replaced fixed px/min-w with fluid padding and width sizing */}
      <div className="border border-gray-300 rounded-lg py-1.5 w-full text-center bg-gray-50/50">
        <span className="text-xl sm:text-2xl font-bold text-gray-900 tabular-nums leading-none block truncate">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 uppercase tracking-wide font-medium truncate w-full text-center">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    // Uses self-center instead of self-end to keep symmetry during fluid scaling
    <span className="text-gray-300 text-lg sm:text-2xl font-light self-center pb-4 sm:pb-5 select-none">
      |
    </span>
  );
}

function OfferCardItem({ deal }: OfferCardItemProps) {
  // `deal.end_at` / `deal.title` threw for a null deal; fieldsOf keeps that.
  const { end_at, banner, title, slug } = fieldsOf(deal);
  const time = useCountdown(end_at);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative w-full aspect-4/3">
        <Image
          src={str(banner) ?? ""}
          alt={str(title) ?? ""}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={false}
        />
      </div>

      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-4">
        {/* Added line-clamp to protect layout from super long titles */}
        <h2 className="text-base sm:text-[17px] font-semibold text-gray-900 text-center leading-snug line-clamp-2 h-11 flex items-center justify-center">
          {nodeOf(title)}
        </h2>

        {/* Changed gap to 1.5 and items-center to balance the countdown components fluidly */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          <TimeUnit value={time.days} label="Day" />
          <Divider />
          <TimeUnit value={time.hours} label="Hrs" />
          <Divider />
          <TimeUnit value={time.mins} label="Min" />
          <Divider />
          <TimeUnit value={time.secs} label="Sec" />
        </div>

        {/* mt-auto forces button to the bottom if cards in the same row have uneven heights */}
        <PreFetchLink
          prefetch={false}
          href={`/shop/offer/${String(slug)}`}
          className="w-full bg-secondary text-white text-sm sm:text-base font-medium py-2.5 sm:py-3 rounded-xl transition-colors duration-150 text-center mt-auto"
        >
          View Details
        </PreFetchLink>
      </div>
    </div>
  );
}

export default function OfferCard({ offers = [] }: OfferCardProps) {
  return (
    <section className="">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#4a4a4a] mb-6 lg:mb-10 text-center sm:text-left">
        Latest Offers
      </h2>
      {/* Enhanced grid breakdown with md: breakpoint for smooth structural transitions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {mapList(offers, (deal) => (
          <OfferCardItem key={idKey(deal)} deal={deal} />
        ))}
      </div>
    </section>
  );
}
