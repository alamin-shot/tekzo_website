"use client";

import {
  Smartphone,
  Laptop,
  Tablet,
  SmartphoneNfc,
  Watch,
  Cpu,
} from "lucide-react";

const CATEGORIES = [
  { label: "iPhone", icon: Smartphone },
  { label: "MacBook", icon: Laptop },
  { label: "iPad", icon: Tablet },
  { label: "Android", icon: SmartphoneNfc },
  { label: "Watch", icon: Watch },
  { label: "Others", icon: Cpu },
];

export default function TekzoCareServices() {
  return (
    <section className=" py-10 lg:py-15">
      {/* Header */}
      <div className="mx-auto mb-8 lg:mb-16 max-w-7xl space-y-4 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-[#18ac8f] via-[#6baa0b] to-[#e96c27] bg-clip-text text-transparent  md:text-4xl">
          What We Fix For You
        </h2>

        <p className="pt-2 text-sm lg:text-base leading-relaxed text-gray-600">
          At <strong className="font-semibold text-gray-900">TEKZO Care</strong>
          , we provide expert repair and maintenance services for all leading
          smartphone and tablet brands, including Apple (iPhone & iPad), Samsung
          Galaxy, Xiaomi, OnePlus, OPPO, vivo, Google Pixel, and other Android
          devices. From cracked displays and battery replacements to charging
          port repairs, water damage recovery, and advanced hardware
          diagnostics, our certified technicians deliver precise, reliable, and
          efficient solutions using professional-grade tools and high-quality
          replacement components.
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 2xl:grid-cols-6 ">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;

          return (
            <div
              key={cat.label}
              className="group relative cursor-pointer rounded-2xl border border-gray-100 bg-dark p-6 transition-all duration-300 hover:-translate-y-1 hover:border-transparent shadow-xs hover:shadow-sm"
            >
              {/* Orange Overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-[0.02]" />

              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 group-hover:bg-[#18ac8f12]">
                  <Icon className="h-7 w-7 text-gray-700 transition-colors duration-300 group-hover:text-secondary" />
                </div>

                {/* Label */}
                <span className="text-sm font-bold tracking-tight text-gray-800 transition-colors duration-300 group-hover:text-primary">
                  {cat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
