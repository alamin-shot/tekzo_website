"use client";

import {
  Zap,
  Truck,
  ShieldCheck,
  Award,
  BadgeCheck,
  MapPinHouse,
} from "lucide-react";

const WHY_CHOOSE_US = [
  {
    title: "Fast & Reliable Diagnostics",
    desc: "We understand how critical your workspace hardware is. Our team guarantees express diagnostics and high-tier turnaround workflows to secure a long-lasting fix.",
    icon: Zap,
  },
  {
    title: "Premium Pick & Drop Facility",
    desc: "Enjoy completely hassle-free logistics for device repairs across Dhaka. Simply schedule your pickup online, and our secure courier team handles the rest.",
    icon: Truck,
  },
  {
    title: "Extended Service Warranty",
    desc: "We confidently offer an extensive servicing warranty structural tier across hardware fixes, ensuring your system operates optimally under heavy performance.",
    icon: ShieldCheck,
  },
  {
    title: "Specialized Apple Workspace Care",
    desc: "Dedicated diagnostics tailored for premium international ecosystems, providing precise architectural restorations matching strict global configurations.",
    icon: Award,
  },
  {
    title: "Certified Components Guarantee",
    desc: "We exclusively source premium grade-A component pieces that seamlessly match strict manufacturer criteria for absolute stability and peak performance.",
    icon: BadgeCheck,
  },
  {
    title: "Accessible Network Branches",
    desc: "No matter where you initially sourced your equipment, simply visit our central TEKZO Care hubs with your support tickets for direct engineering care.",
    icon: MapPinHouse,
  },
];

export default function TekzoCareValueProposition() {
  return (
    <section className="pt-7 lg:pt-15  selection:bg-secondary/10">
      {/* ── HEADER BLOCK ── */}
      <div className="text-center max-w-3xl mx-auto mb-6 lg:mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full">
          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary">
            The TEKZO Advantage
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-linear-to-r from-[#18ac8f] via-[#6baa0b] to-[#e96c27] bg-clip-text text-transparent ">
          Why Choose TEKZO CARE
        </h2>

        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium">
          Discover a high-standard digital ecosystem where premium client
          service meets pristine hardware restoration standards.
        </p>
      </div>

      {/* ── SCALED-UP SOFT-SHADOW INTERACTIVE GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        {WHY_CHOOSE_US.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="group relative flex flex-col items-center text-center p-3 lg:p-8 bg-dark rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden cursor-pointer hover:-translate-y-1"
            >
              {/* Subtle Indicator Line */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-primary transition-all duration-300 group-hover:w-1/3 rounded-full" />

              {/* Scaled Icon Ring Structure */}
              <div className="mb-3 lg:mb-6 flex-shrink-0">
                <div className="w-14 h-14 rounded-full flex items-center justify-center border border-gray-100/80 transition-all duration-300 group-hover:bg-secondary/10 group-hover:border-transparent group-hover:scale-105">
                  <Icon className="w-6 h-6 text-gray-600 transition-colors duration-300 group-hover:text-secondary" />
                </div>
              </div>

              {/* Enhanced Typography Layers */}
              <div className="space-y-2.5">
                <h3 className="text-sm md:text-lg font-extrabold text-gray-900 tracking-tight transition-colors duration-300 group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
