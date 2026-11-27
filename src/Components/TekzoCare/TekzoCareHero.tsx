"use client";

import { useEffect, useRef } from "react";

import { Apple, Laptop, Smartphone, Monitor } from "lucide-react";

const DEVICES = [
  { label: "iPhone", icon: <Apple />, color: "text-violet-600" },
  { label: "MacBook", icon: <Laptop />, color: "text-blue-600" },
  { label: "Samsung", icon: <Smartphone />, color: "text-teal-600" },
  { label: "Android", icon: <Smartphone />, color: "text-pink-600" },
  { label: "All Devices", icon: <Monitor />, color: "text-teal-600" },
];

const ORBIT_ITEMS = [
  {
    icon: <Apple />,
    pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    color: "text-violet-600",
  },
  {
    icon: <Smartphone />,
    pos: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
    color: "text-teal-600",
  },
  {
    icon: <Laptop />,
    pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
    color: "text-blue-600",
  },
  {
    icon: <Smartphone />,
    pos: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
    color: "text-pink-600",
  },
];

const STATS = [
  { val: "5K+", label: "Devices Fixed" },
  { val: "24h", label: "Turnaround" },
  { val: "100%", label: "Genuine Parts" },
];

export default function TekzoCareHero() {
  const primaryColor = "#fe762d"; // Orange
  const secondaryColor = "#18ac8f"; // Teal

  return (
    <section className=" relative flex flex-col lg:flex-row items-center overflow-hidden ">
      <span className="hidden lg:block absolute bottom-[50px] right-[100px] text-[200px] font-bold text-gray-50/20">TEKZO CARE</span>

      <div
        className=" absolute bottom-[-80px] right-4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${primaryColor}0A 0%, transparent 70%)`,
        }}
      />

      {/* RESPONSIVE CONTAINER ASSEMBLY */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full items-center  ">
        {/* ── LEFT: CONTENT REGION ── */}
        <div className="w-full lg:flex-[1.1] py-6 lg:py-10  text-center lg:text-left flex flex-col items-center lg:items-start">
          {/* Headline - Responsive Clamped Typography Sizes */}
          <h1 className="font-extrabold leading-[1.15] tracking-tight  mb-4 text-3xl sm:text-4xl lg:text-[42px] bg-linear-to-r from-[#18ac8f] via-[#6baa0b] to-[#e96c27] bg-clip-text text-transparent ">
            Expert Repair for <br />
            iPhone, MacBook, <br />
            Samsung & All Devices
          </h1>

          {/* Subtitle - Gray text */}
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
            Fast, reliable service with <span className="text-gray-900 font-semibold">genuine parts</span> and <span className="text-gray-900 font-semibold">Certified Technicians</span> - backed by
            official TEKZO warranty parameters. Right here in Dhaka.
          </p>

          {/* Device tags - Flex wraps responsive grid layout cleanly */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 sm:gap-2 mb-7 max-w-xl lg:max-w-none ">
            {DEVICES.map(({ label, icon, color }) => (
              <span key={label} className="flex items-center gap-1.5 rounded-md border border-gray-100 bg-dark px-2.5 py-1 text-[11px] sm:text-[11.5px] font-semibold text-gray-700 shadow-xs">
                {label}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto mb-8">
            <button
              className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-[13.5px] font-extrabold text-white transition-all hover:-translate-y-px active:scale-[.98] shadow-md shadow-primary/10 w-1/2 sm:w-auto whitespace-nowrap cursor-pointer"
              style={{
                backgroundColor: secondaryColor,
              }}
            >
              <i className="ti ti-tool text-[15px]" aria-hidden="true" />
              Book a Repair
            </button>
            <button className="rounded-xl border border-gray-200 bg-dark px-4 py-3 text-xs sm:text-[13px] font-bold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800 w-1/2 sm:w-auto whitespace-nowrap cursor-pointer">
              See all services
            </button>
          </div>

          {/* Stats row - Light gray dividers */}
          <div className="flex w-full sm:max-w-md overflow-hidden rounded-xl border border-gray-100 bg-dark shadow-inner">
            {STATS.map(({ val, label }, i) => (
              <div key={label} className={`flex-1 py-3 px-2 sm:px-4 text-center ${i < STATS.length - 1 ? "border-r border-gray-100" : ""}`}>
                <p className="text-lg sm:text-[20px] font-extrabold leading-none mb-1 text-gray-900">
                  <span style={{ color: secondaryColor }}>{val.replace(/[^0-9]/g, "")}</span>
                  <span style={{ color: secondaryColor }}>{val.replace(/[0-9]/g, "")}</span>
                </p>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: VISUAL ORBIT REGION ── */}
        <div className="w-full lg:flex-[0.9] flex items-center justify-center px-6 sm:px-10 py-10 sm:py-16 lg:py-12 relative mt-4 lg:mt-0 ">
          {/* Orbit dynamic framework wrapper container */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 my-4 ">
            {/* Orbit rings - Secondary Teal */}
            <div className="absolute inset-0 rounded-full border" style={{ borderColor: `${secondaryColor}20` }} />
            <div className="absolute -inset-6 sm:-inset-7 rounded-full border" style={{ borderColor: `${secondaryColor}10` }} />

            {/* Spinning dot animation tracking system */}
            <div className="absolute inset-0 rounded-full" style={{ animation: "orbit-spin 12s linear infinite" }}>
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: secondaryColor,
                  boxShadow: `0 0 8px ${secondaryColor}`,
                }}
              />
            </div>

            {/* Device icons at cardinal positions */}
            {ORBIT_ITEMS.map(({ icon, pos, color }, index) => (
              <div key={index} className={`absolute ${pos} flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 bg-dark shadow-sm sm:h-12 sm:w-12`}>
                <span className={color}>{icon}</span>
              </div>
            ))}

            {/* Center Core Badge */}
            <div
              className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-[72px] sm:h-[72px] flex flex-col items-center justify-center gap-0.5 rounded-[16px] sm:rounded-[18px] border shadow-sm bg-dark"
              style={{
                borderColor: `${primaryColor}40`,
              }}
            >
              <i className="ti ti-tool text-xl sm:text-2xl" style={{ color: primaryColor }} aria-hidden="true" />
              <span className="text-[8px] font-extrabold tracking-widest uppercase " style={{ color: primaryColor }}>
                Care
              </span>
            </div>
          </div>

          {/* Warranty Badge - Hidden on very small items to save structural space layout */}
          <div className="absolute top-0 right-4 sm:right-2 flex items-center gap-2 rounded-xl border border-gray-100 bg-dark px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-sm scale-90 sm:scale-100">
            <i className="ti ti-shield-check text-base" style={{ color: secondaryColor }} aria-hidden="true" />
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Warranty</p>
              <p className="text-[11px] font-extrabold text-gray-800">Tekzo Certified</p>
            </div>
          </div>

          {/* Location Badge */}
          <div className="absolute bottom-0 left-4 sm:left-auto sm:right-2 flex items-center gap-2 rounded-xl border border-gray-200 shadow-sm bg-dark px-2.5 py-1.5 sm:px-3 sm:py-2 scale-90 sm:scale-100">
            <i className="ti ti-map-pin text-pink-600 text-base" aria-hidden="true" />
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Location</p>
              <p className="text-[11px] font-extrabold text-gray-800">
                Jamuna Future Park,
                <br /> Dhaka, Bangladesh
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
