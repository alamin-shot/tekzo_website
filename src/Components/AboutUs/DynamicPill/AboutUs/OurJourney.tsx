import React from "react";
import AboutSectionHeading from "../../ReuseableComponent/AboutSectionHeading";
import type { TimelineItem } from "@/types/props/content";

export default function OurJourney() {
  const timelineData: TimelineItem[] = [
    {
      description:
        "Brand Acquisition: In a short window, We successfully marks authentic 100’s of international brands like Apple, Samsung, Honor,Voltme, Tozo, Anker, and Ugreen etc. ensuring that Bangladeshi consumers have access to genuine products with official warranties.",
    },
    {
      description:
        "Retail Expansion: From its initial launch, the chain has focused on strategic locations in major tech hubs ( Jamuna Future Park), prioritizing accessibility for urban tech enthusiasts.",
    },
    {
      description:
        "E-Commerce Focused: Tekzo: Tekzo grabs a big tech e-commerce platform through their website to reach every knocking customer interest can cope up with leave the door order in one click. We ensure the genuine product to showcase the real scenario on our platform.",
    },
    {
      description:
        "Community Building: TEKZO utilized social media aggressively during its first half-year to build a tech-lifestyle community, moving beyond simple sales to offer product reviews and tech tips that resonate with Gen Z and millennial buyers.",
    },
    {
      description:
        "Service Reliability: A major part of their success has been their emphasis on after-sales support, helping them build the trust necessary to compete with long-established giants in the Bangladeshi retail sector.",
    },
  ];
  return (
    <section className="">
      {/* Header Section */}
      <AboutSectionHeading>Our Journey</AboutSectionHeading>
      <p className="text-gray-800 text-sm lg:text-base leading-relaxed font-medium">
        Our journey is all about{" "}
        <span className="font-bold text-gray-900">innovation and customer trust.</span> We’re
        building a tech destination where customers can discover the latest
        trends, enjoy a seamless online browsing experience, and shop with peace
        of mind knowing that each product is genuine and supported by reliable
        service.
      </p>

      {/* Timeline Container */}
      <div className="mb-12 mt-4 lg:mt-8 relative border-l-2 border-gray-300 ml-3 md:ml-6 space-y-4 lg:space-y-6 ">
        {timelineData.map((item, index) => (
          <div key={index} className="relative pl-6 md:pl-8">
            {/* Timeline Dot */}
            <div className=" absolute -left-[13px] top-1 w-6 h-6 bg-secondary rounded-full border-4 border-white shadow-xs"></div>

            {/* Text Content */}
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-gray-900">
                  {item.year}
                </span>
                <span className="text-lg font-bold text-gray-800">
                  {item.title}
                </span>
              </div>

              {/* Description Box */}
              <div className="bg-dark border border-gray-100 p-6 md:p-8 rounded-[2rem] shadow-xs">
                <p className="text-gray-800 text-sm lg:text-base leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
