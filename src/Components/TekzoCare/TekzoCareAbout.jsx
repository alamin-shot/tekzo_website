"use client";

import Image from "next/image";

export default function TekzoCareAbout() {
  const primaryColor = "#fe762d"; // Orange
  const secondaryColor = "#18ac8f"; // Teal

  const brands = [
    "Apple",
    "Samsung",
    "Xiaomi",
    "OnePlus",
    "Oppo",
    "Vivo",
    "Realme",
  ];
  const services = [
    "Screen Issue",
    "Battery Replacement",
    "Charging Port",
    "Water Damage",
  ];

  return (
    <section className="py-5 pt-10 lg:pt-5 ">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* ── LEFT SIDE: MODERN GEOMETRIC IMAGE COMPOSITION ── */}
        <div className="lg:col-span-5 relative flex justify-center aspect-3/4 lg:aspect-3/4 2xl:aspect-square">
          {/* Main Image Frame with sleek overlapping borders */}
          <div className="relative z-10 w-full rounded-3xl lg:rounded-[40px] overflow-hidden shadow-xl group">
            <Image
              src="/tekzo-care/mobile-repairing-technician.png" // Replace with your actual asset path
              alt="Tekzo Care professional technician repairing a smartphone"
              fill sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority // Optional: adds preloading if this section sits high up on the page viewport
              fetchPriority="high"
            />
          </div>
        </div>

        {/* ── RIGHT SIDE: CONTENT & TYPOGRAPHY ── */}
        <div className="lg:col-span-7 space-y-4 lg:space-y-6">
          {/* Section Indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-[2px]"
              style={{ backgroundColor: primaryColor }}
            />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: primaryColor }}
            >
              Who We Are
            </span>
          </div>
          {/* Heading inspired by image_fbeabb.jpg */}
          <h2 className="text-3xl 2xl:text-4xl font-extrabold tracking-tight leading-[1.2] bg-linear-to-r from-[#18ac8f] via-[#6baa0b] to-[#e96c27] bg-clip-text text-transparent ">
            We Can Repair It Almost As Quickly As You Can Damage It
          </h2>

          {/* First Paragraph: Brand Introduction */}
          <p className="text-gray-600 text-sm 2xl:text-base leading-relaxed">
            <strong className="text-gray-900 font-semibold">TEKZO Care</strong>{" "}
            is the official premium mobile device repair division of TEKZO Tech,
            dedicated to delivering professional repair solutions for
            smartphones and tablets. Conveniently located at Shop: 4A-018A,
            Level: 4, Block: A, Jamuna Future Park, Dhaka, Bangladesh, TEKZO
            Care combines certified expertise, industry-leading repair
            standards, and a customer-first approach to ensure every device is
            restored with precision, reliability, and exceptional care.
          </p>
          {/* Second Paragraph: Specialization Details */}
          <p className="text-gray-600 text-sm 2xl:text-base leading-relaxed">
            We specialize in the repair and maintenance of all major smartphone
            and tablet brands. From complex hardware failures to everyday wear
            and tear, our highly skilled technicians utilize advanced diagnostic
            equipment, state-of-the-art tools, and premium-quality components to
            deliver accurate, efficient, and long-lasting repair solutions you
            can trust.
          </p>

          {/* Visual Breakdown: Supported Brands */}
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Supported Brands
            </p>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((brand) => (
                <span
                  key={brand}
                  className="text-xs font-medium px-2.5 py-1 bg-dark border border-gray-200 text-gray-700 rounded-md"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
          {/* Visual Breakdown: Core Troubleshooting Expertise */}
          <div className="pt-2 grid grid-cols-2 gap-3 max-w-md">
            {services.map((service) => (
              <div
                key={service}
                className="flex items-center gap-2 text-sm text-gray-700 bg-dark p-2.5 px-3.5 rounded-xl border border-gray-200/80 shadow-xs"
              >
                <i
                  className="ti ti-circle-check text-base"
                  style={{ color: secondaryColor }}
                />
                <span className="font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
