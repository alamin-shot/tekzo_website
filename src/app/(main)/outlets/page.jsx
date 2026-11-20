import React from "react";
import Image from "next/image";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import { MapPin } from "lucide-react";
import { GrLocation } from "react-icons/gr";
import Link from "next/link";
import { getOutlets } from "@/lib/api";
import { buildMetadata } from "@/utils/buildMetadata";

export async function generateMetadata() {
  const { seoData } = await getOutlets();
  return buildMetadata(seoData, "outlets", "/all-product-banner.webp");
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default async function OutletsPage() {
  const { outlets, seoData } = await getOutlets();

  return (
    <div className="">
      <Banner
        image={seoData?.banner ?? "/loginPage/contact-about-bg.webp"}
        title={seoData?.title ?? "Our Stores"}
      />

      <main className="container">
        <GrLocation className="fixed top-10 -right-20 lg:-top-[100px] lg:-right-[200px] text-[400px] lg:text-[1000px] -z-10 text-gray-100 opacity-50" />
        <Breadcrumbs />

        {/* Hero Section */}
        <section className=" dp">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Our <span className="text-zinc-400">Stores.</span>
          </h1>
          <div className="h-1 w-20 bg-primary mb-8 rounded-full" />
          <p className="text-xl text-zinc-500 max-w-2xl font-medium leading-relaxed">
            Find an authorized location to explore the latest products or get
            professional service.
          </p>
        </section>

        {/* Outlets Grid */}
        {outlets.length === 0 ? (
          <p className="text-center text-zinc-400 py-20 text-lg">
            No outlets found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-gap my-mt">
            {outlets.map((outlet) => (
              <div
                key={outlet.id}
                className="group flex flex-col bg-dark/70 p-3 lg:p-4 rounded-4xl"
              >
                {/* Image */}
                <div className="relative h-72 w-full overflow-hidden rounded-3xl bg-zinc-100 mb-8 shadow-sm">
                  {outlet.image ? (
                    <Image
                      src={outlet.image}
                      alt={outlet.name}
                      fill
                      className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
                      <MapPin size={40} className="text-zinc-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Info */}
                <div className="flex flex-col grow ">
                  <h2 className="text-2xl font-bold tracking-tight mb-6 leading-snug">
                    {outlet.name}
                  </h2>

                  <div className="space-y-4 mb-10 text-zinc-500 font-medium">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={18}
                        className="text-zinc-300 mt-0.5 shrink-0"
                      />
                      <span className="text-sm leading-relaxed">
                        {outlet.address}
                      </span>
                    </div>

                    {/* Hours */}
                    <div className="flex items-start gap-3 border-l-2 border-zinc-100 pl-4 py-1">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                          <span className="text-sm text-zinc-900 font-bold tracking-tight">
                            {formatTime(outlet.opens)} –{" "}
                            {formatTime(outlet.closes)}
                          </span>
                        </div>
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary pl-3.5">
                          {capitalize(outlet.close_day)} Closed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-auto">
                    <Link
                      prefetch={false}
                      href={`/outlets/${outlet.slug}`}
                      className="flex-1 text-sm font-semibold text-center py-4 rounded-full bg-zinc-900 text-white hover:bg-primary transition-all duration-300 active:scale-[0.98]"
                    >
                      Show Details
                    </Link>
                    <a
                      href={outlet.google_map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-14 h-full rounded-full border border-zinc-300 text-zinc-500 hover:text-primary hover:border-primary transition-all active:scale-[0.98]"
                      aria-label="Open in Google Maps"
                    >
                      <MapPin />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
