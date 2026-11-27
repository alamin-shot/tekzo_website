"use client";

import {
  Droplet,
  BatteryCharging,
  Layout,
  Smartphone,
  Sparkles,
  Hammer,
  ArrowRight,
} from "lucide-react";

const ISSUES = [
  {
    title: "Liquid Damage Restoration",
    desc: "Time is critical when exposure happens. Our advanced ultrasonic cleaning and diagnostic flow prevent corrosion and save logic boards.",
    icon: Droplet,
  },
  {
    title: "Premium Battery Replacement",
    desc: "Restore peak performance with high-capacity, certified original units ensuring seamless cycles and official health matrix detection.",
    icon: BatteryCharging,
  },
  {
    title: "Precision Screen Assembly",
    desc: "Flawless glass panel separation matching factory tolerances. Retain true-tone configurations, fluid touch calibration, and pristine brightness.",
    icon: Smartphone,
  },
  {
    title: "Structural Housing Repair",
    desc: "Complete restructuring or direct swaps of damaged external mid-frames, recovering pristine symmetry and reliable component sealing.",
    icon: Layout,
  },
  {
    title: "Display Line & Panel Bonding",
    desc: "Expert micro-soldering solutions for sudden panel disruptions, line artifacts, or full green screen issues without replacing the layout assembly.",
    icon: Sparkles,
  },
  {
    title: "Laser Back Glass Replacement",
    desc: "Precision non-contact fiber laser removal methods ensuring a seamless, debris-free rear surface restore without tampering internal coils.",
    icon: Hammer,
  },
];

export default function TekzoCarePromises() {
  return (
    <section className="py-7 lg:py-15 selection:bg-secondary/10">
      {/* ── HEADER CONTENT: REIMAGINED ASYMMETRICAL STYLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 lg:mb-16">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1] bg-linear-to-r from-[#18ac8f] via-[#6baa0b] to-[#e96c27] bg-clip-text text-transparent ">
            We Promise Stress-Free <br />
            Hardware Architecture Fixes
          </h2>
        </div>

        <div className="lg:col-span-5 border-l-2 border-gray-100 pl-6 lg:pl-8">
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Entrusting your vital workspace equipment to an engineer requires
            total peace of mind. We process every terminal device through
            rigorous diagnostics matching verified global servicing criteria.
          </p>
        </div>
      </div>

      {/* ── POLISHED INTERACTIVE CARD GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {ISSUES.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="group relative flex flex-col justify-between p-6 lg:p-8 bg-dark border border-gray-100 rounded-2xl transition-all duration-300 hover:border-gray-200/40 shadow-sm hover:shadow-md hover:shadow-gray-200/40 overflow-hidden"
            >
              {/* Dynamic Bottom Accent Indicator */}
              <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-secondary transition-all duration-300 group-hover:w-full" />

              <div className="space-y-6">
                {/* Icon Circle Container */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-secondary shadow-sm border border-gray-100 group-hover:border-transparent">
                  <Icon className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-white" />
                </div>

                {/* Text Layout */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight transition-colors duration-300 group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
