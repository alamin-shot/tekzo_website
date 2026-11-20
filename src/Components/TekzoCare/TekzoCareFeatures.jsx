"use client";

import {
  Timer,
  ShieldCheck,
  Cpu,
  MapPin,
  Headphones,
  CalendarCheck,
} from "lucide-react";

const FEATURES = [
  {
    title: "Express Turnaround Time",
    desc: "Most diagnostic assessments and regular component assemblies are completed within the same working day.",
    icon: Timer,
  },
  {
    title: "Certified Engineering Team",
    desc: "Your hardware terminals are handled by factory-trained diagnostic specialists matching international repair metrics.",
    icon: ShieldCheck,
  },
  {
    title: "OEM & Premium Sourced Parts",
    desc: "We exclusively deploy strict grade-A components and genuine original parts backed by authentic warranty coverage.",
    icon: Cpu,
  },
  {
    title: "Centralized Lab Location",
    desc: "Conveniently situated in the heart of Dhaka at Panthapath, offering easy accessibility and high-security handling.",
    icon: MapPin,
  },
  {
    title: "Dedicated Support Desk",
    desc: "Comprehensive tracking transparency and clear step-by-step documentation from check-in to final handover.",
    icon: Headphones,
  },
  {
    title: "Digital Reservation System",
    desc: "Avoid waiting times entirely by securing a precise hardware priority queue placement through our remote booking channel.",
    icon: CalendarCheck,
  },
];

export default function TekzoCareFeatures() {
  return (
    <section className="py-5 lg:py-10 selection:bg-secondary/10">
      {/* ── HEADER CONTENT (Polished from image_0928de.jpg) ── */}
      <div className="text-center max-w-2xl mx-auto mb-6 lg:mb-14 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 rounded-full">
          <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">
            Why Choose Us
          </span>
        </div>

        <h2 className="text-2xl md:text-4xl font-extrabold  tracking-tight bg-linear-to-r from-[#18ac8f] via-[#6baa0b] to-[#e96c27] bg-clip-text text-transparent ">
          Our Core Servicing Premium Features
        </h2>

        <p className="text-gray-500 text-xs md:text-base leading-relaxed max-w-xl mx-auto">
          Once you discover the streamlined diagnostic flow at TEKZO Care, you
          can fully relax. We manage your critical devices with absolute
          accuracy and professional handling protocols.
        </p>
      </div>

      {/* ── MODERN MINIMALIST 3x2 FEATURE GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {FEATURES.map((feat, index) => {
          const Icon = feat.icon;
          return (
            <div
              key={index}
              className="group relative flex items-start gap-5 p-6 bg-dark rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden cursor-pointer"
            >
              {/* Left Accent Hover Bar (Slightly thicker alignment) */}
              <div className="absolute top-0 left-0 h-full w-[3px] bg-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Scaled Icon Block (w-9/h-9 -> w-11/h-11, rounded-lg -> rounded-xl) */}
              <div className="flex-shrink-0">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-gray-100 transition-all duration-300 group-hover:bg-secondary/10 group-hover:border-transparent">
                  {/* Icon Scaled (w-4/h-4 -> w-5/h-5) */}
                  <Icon className="w-5 h-5 text-gray-600 transition-colors duration-300 group-hover:text-secondary" />
                </div>
              </div>

              {/* Text Blocks (Increased internal space-y) */}
              <div className="space-y-1.5">
                {/* Title Scaled (text-sm -> text-base) */}
                <h3 className="text-base font-bold text-gray-900 tracking-tight transition-colors duration-300 group-hover:text-primary">
                  {feat.title}
                </h3>
                {/* Description Scaled (text-[11.5px] -> text-xs) */}
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
