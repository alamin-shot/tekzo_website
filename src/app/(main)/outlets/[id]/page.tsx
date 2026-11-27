import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatHtml } from "@/lib/formatHtml";
import { GrLocation } from "react-icons/gr";
import {
  FiPhone,
  FiClock,
  FiMapPin,
  FiMail,
  FiShield,
  FiTool,
  FiSmartphone,
} from "react-icons/fi";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import { getOutlets } from "@/lib/api";
import { capitalize, formatOutletTime } from "@/lib/outletFormat";
import type { ParamsOnlyProps } from "@/types/route";
import { fieldsOf, lengthStrict, mapList, rec } from "@/lib/json";
import { keyFrom, nodeOf, str } from "@/lib/render";

// Without this, Next has no way to know which outlet slugs exist at build
// time, so the route falls back to fully on-demand rendering even though
// the underlying fetch below is already cached (revalidate: 3600) — this
// lets it be prerendered (SSG) instead, matching brands/[slug].
export async function generateStaticParams() {
  const { outlets } = await getOutlets();
  return mapList(outlets, (outlet) => ({ id: fieldsOf(outlet).slug }));
}

async function getOutlet(slug: string): Promise<unknown> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/outlets/${slug}/detail`,
      {
        headers: {
          Accept: "application/json",
          ...(process.env.INTERNAL_API_TOKEN && { "X-Internal-Token": process.env.INTERNAL_API_TOKEN }),
        },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return rec(json)?.data ?? null;
  } catch (e) {
    console.error("Failed to fetch outlet detail", e);
    return null;
  }
}

// formatTime / capitalize moved to lib/outletFormat.ts (shared with the other outlet page)
const formatTime = formatOutletTime;

const SERVICES = [
  {
    icon: <FiSmartphone />,
    title: "Live Demo",
    desc: "Hands-on experience with the latest devices.",
  },
  {
    icon: <FiShield />,
    title: "Official Warranty",
    desc: "Guaranteed authentic products with support.",
  },
  {
    icon: <FiTool />,
    title: "Quick Repair",
    desc: "On-site diagnostics and minor hardware fixes.",
  },
];

export default async function OutletDetailPage({ params }: ParamsOnlyProps) {
  const { id } = await params;
  const data = await getOutlet(id);

  if (!data) return notFound();
  // `outlet.x` on a truthy payload (a primitive has no fields, as before)
  const outlet = fieldsOf(data);

  const hours = `${formatTime(outlet.opens)} – ${formatTime(outlet.closes)}`;
  const mainImage = outlet.image;
  const galleryImages = outlet.images ?? [];

  return (
    <main className="overflow-x-hidden">
      <Banner image={"/loginPage/contact-about-bg.webp"} title={outlet.name} />

      <GrLocation className="fixed top-10 -right-20 lg:-top-[100px] lg:-right-[200px] text-[400px] lg:text-[1000px] -z-10 text-gray-100 opacity-50" />

      <div className="container pt-12 lg:pt-16">
        <Breadcrumbs />

        {/* Header */}
        <header className="mb-8 lg:mb-16 mt-6 lg:mt-8">
          <div className="mb-8 lg:mb-16">
            <h1 className="text-xl lg:text-5xl xl:text-6xl font-[1000] tracking-tight leading-[0.85] text-[#1D1D1F]">
              {nodeOf(outlet.name)}
              <span className="text-orange-700">.</span>
            </h1>
          </div>
        </header>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 lg: dp">
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Location Card */}
            <div className="bg-white p-6 lg:p-10 h-full rounded-3xl lg:rounded-[40px] shadow-sm border border-gray-100 group hover:border-orange-200 transition-colors relative overflow-hidden">
              <FiMapPin className="absolute -right-12 -top-12 text-black/4 text-[240px] transition-transform duration-1000 group-hover:rotate-30" />
              <div className="flex items-center gap-4 mb-10 text-orange-700">
                <div className="p-4 bg-orange-50 rounded-3xl lg:rounded-[40px] group-hover:bg-orange-700 group-hover:text-white transition-all duration-500">
                  <FiMapPin size={24} />
                </div>
                <span className="font-bold uppercase tracking-[0.2em] text-[10px]">
                  Location
                </span>
              </div>
              <p className="text-xl lg:text-2xl text-gray-800 font-bold leading-tight tracking-tight mb-2">
                {nodeOf(outlet.address)}
              </p>
              {nodeOf(outlet.google_map_url && (
                <a
                  href={str(outlet.google_map_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary font-semibold mt-3 hover:underline"
                >
                  Open in Maps →
                </a>
              ))}
            </div>

            {/* Hours Card */}
            <div className="bg-[#1D1D1F] text-white p-6 lg:p-10  h-full rounded-3xl lg:rounded-[40px] relative overflow-hidden group">
              <FiClock className="absolute -right-12 -top-12 text-white/4 text-[240px] transition-transform duration-1000 group-hover:rotate-30" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10 text-orange-400">
                  <div className="p-4 bg-white/10 rounded-3xl lg:rounded-[40px]">
                    <FiClock size={24} />
                  </div>
                  <span className="font-bold uppercase tracking-[0.2em] text-[10px]">
                    Business Hours
                  </span>
                </div>
                <p className="text-3xl lg:text-4xl font-bold tracking-tighter mb-4">
                  {hours}
                </p>
                <div className="text-red-600 font-medium italic">
                  Closed on {capitalize(outlet.close_day)}
                </div>
              </div>
            </div>
          </div>

          {/* Services + Contact Card */}
          <div className="lg:col-span-8 p-6 lg:p-10 lg:p-16 bg-white rounded-3xl lg:rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl lg:text-4xl font-extrabold mb-14 tracking-tight">
                Premium Experience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {SERVICES.map((service, i) => (
                  <div key={i} className="group/s">
                    <div className="text-6xl lg:text-4xl text-gray-300 group-hover/s:text-primary transition-all duration-500 mb-6 group-hover/s:-translate-y-2">
                      {service.icon}
                    </div>
                    <h4 className="font-bold text-xl mb-3 tracking-tight">
                      {service.title}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                      {service.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-gray-50 flex flex-wrap gap-4 relative z-10">
              {nodeOf(outlet.phone && (
                <a
                  href={`tel:${String(outlet.phone)}`}
                  className="bg-orange-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-orange-700 transition-all active:scale-95"
                >
                  <FiPhone /> Call Specialist
                </a>
              ))}
              {nodeOf(outlet.email && (
                <Link
                  prefetch={false}
                  href="/contact-us"
                  className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-700 transition-all active:scale-95"
                >
                  <FiMail /> Send Message
                </Link>
                // <a
                //   href={`mailto:${outlet.email}`}
                //   className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-700 transition-all active:scale-95"
                // >
                //   <FiMail /> Send Email
                // </a>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery */}
        {nodeOf((mainImage || Number(lengthStrict(galleryImages)) > 0) && (
          <section className="mb-10 lg:mb-15 space-y-4 lg:space-y-6">
            {/* Main image */}
            {nodeOf(mainImage && (
              <div className="relative w-full h-[200px] md:h-[600px] overflow-hidden rounded-3xl lg:rounded-[40px] group bg-gray-200">
                <Image
                  src={str(mainImage) ?? ""}
                  alt={str(outlet.name) ?? ""}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="100vw"
                  className="object-cover transition-all duration-[2s] group-hover:scale-105"
                />
              </div>
            ))}

            {/* Gallery images */}
            {Number(lengthStrict(galleryImages)) > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {mapList(galleryImages, (img, i) => (
                  <div
                    key={keyFrom(fieldsOf(img).id ?? i)}
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl lg:rounded-[40px] group bg-gray-100 border border-gray-50 shadow-sm"
                  >
                    <Image
                      src={str(fieldsOf(img).image_url) ?? ""}
                      alt={str(fieldsOf(img).alt_text ?? outlet.name) ?? ""}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                    />
                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
        {/* desc */}
        {nodeOf(outlet.description && (
          <div
            className="max-w-4xl text-base xl:text-xl text-gray-500 leading-relaxed font-medium tracking-tight prose prose-sm rendered-html"
            dangerouslySetInnerHTML={{ __html: formatHtml(outlet.description) }}
          />
        ))}
        {/* Map */}
        {nodeOf(outlet.google_map_url && (
          <div className="mb-16 h-auto md:h-[650px] w-full rounded-3xl lg:rounded-[40px] overflow-hidden">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(String(outlet.address))}&output=embed`}
              className="w-full h-[400px] md:h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
