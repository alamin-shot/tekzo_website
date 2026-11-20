"use client"; // Required for useState in Next.js App Router

import { useState } from "react";
import Image from "next/image";
import AboutUs from "./DynamicPill/AboutUs/AboutUs";
import MarketPresence from "./DynamicPill/MarketPresence/MarketPresence";
import OurFeatures from "./DynamicPill/OurFeatures/OurFeatures";
import AboutSectionHeading from "./ReuseableComponent/AboutSectionHeading";
import AboutStores from "./DynamicPill/AboutStores/AboutStores";

const PILL_COMPONENTS = {
  "About Us": AboutUs,
  // "About Brands": AboutBrands,
  "About Stores": AboutStores,
  "Market Presence": MarketPresence,
  "Our Features": OurFeatures,
};

export default function AboutHeading() {
  const [activePill, setActivePill] = useState("About Us");
  const pillKeys = Object.keys(PILL_COMPONENTS);
  const ActiveComponent = PILL_COMPONENTS[activePill];

  return (
    <div className="">
      <section className="py-6 lg:py-14 flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
        {/* LEFT CONTENT */}
        <div className="flex-1 flex flex-col justify-between self-stretch">
          <div className="">
            <AboutSectionHeading>Our Story</AboutSectionHeading>

            {/* STATIC TEXT: This stays the same */}
            <div className="space-y-3 lg:space-y-4 text-gray-800 font-medium text-sm mb-4 lg:text-lg leading-relaxed lg:pr-15">
              <div className="">
                <span className="font-bold text-gray-900">TEKZO</span> is more than a
                seller—it’s an{" "}
                <span className="font-bold text-gray-900">
                  <span className="font-bold text-gray-900">
                    officially authorized gateway to genuine multi-branded
                    reseller chain shop
                  </span>{" "}
                </span>{" "}
                for your premier destination for authentic smartphones,
                cutting‑edge gadgets, and high‑quality tech accessories in
                Bangladesh.
              </div>
              <div className="">
                At <span className="font-bold text-gray-900">TEKZO</span>, we believe that
                technology should enhance everyday life — not complicate it. Our
                mission is to bring the latest mobile devices, trusted
                accessories, and innovative tech solutions under one roof,
                making it easy and exciting for customers to explore, compare,
                and shop with confidence.
              </div>
              <div className="">
                Founded as part of the vision to elevate the tech shopping
                experience locally, TEKZO strives to blend in every interaction.
                Whether you’re looking for flagship smartphones, smart watches,
                premium earphones, power solutions, or lifestyle gadgets, our
                carefully curated collection reflects the best products from
                leading global brands paired with competitive pricing.
              </div>
            </div>
          </div>

          {/* INTERACTIVE BUTTONS */}
          <div className="hidden lg:flex items-center gap-2 lg:gap-4">
            {pillKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActivePill(key)}
                className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 cursor-pointer text-sm ${
                  activePill === key
                    ? "bg-primary text-white shadow-md ring-1 ring-primary/20"
                    : "bg-dark text-gray-800 hover:text-gray-950 border border-gray-100 shadow-2xs"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT IMAGE SECTION */}
        <div className="flex-1 w-full max-w-xl">
          <div className="relative aspect-square lg:aspect-4/3 rounded-[16%] overflow-hidden">
            <Image
              src="/founder.webp" // Ensure this image is in your /public folder
              alt="Atick Hasan Sajib - Founder & CEO"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              fetchPriority="high"
            />

            {/* CEO INFO OVERLAY */}
            <div className="absolute bottom-0 right-0 left-0 p-3 lg:p-6 rounded-[2rem] rounded-t-none bg-black/40 backdrop-blur-md border border-white/20 text-center text-white">
              <h3 className="text-2xl font-bold tracking-tight">
                Atick Hasan Sajib
              </h3>
              <p className="text-sm font-light uppercase tracking-[0.3em] opacity-90 mt-1">
                Founder & CEO
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="lg:hidden grid grid-cols-2 gap-2 py-4">
        {pillKeys.map((key) => (
          <button
            key={key}
            onClick={() => setActivePill(key)}
            className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all duration-300 cursor-pointer text-xs ${
              activePill === key
                ? "bg-primary text-white shadow-md ring-1 ring-primary/20"
                : "bg-dark text-gray-600 hover:text-gray-900 border border-gray-100 shadow-2xs"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      {/* DYNAMIC PILL CONTENT: Rendered AFTER buttons based on active selection */}
      <div className="mt-4 lg:mt-0">
        <ActiveComponent />
      </div>
    </div>
  );
}
