"use client";

import Banner from "@/Components/ReuseableComponent/Banner";
import Image from "next/image";

export default function HowToActive() {
  return (
    <div className="min-h-screen ">
      <Banner image={"/loginPage/contact-about-bg.webp"} title={"How to Active"} />

      <div className="lg:px-20 py-10">
        {/* Header */}
        <h1 className="text-2xl md:text-4xl  text-center text-gray-800 mb-8">How To Active Your Warranty</h1>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-0  lg:*:w-[50%]">
          <Image src="/claim/Claim1.jpg" alt="claim instruction" className="w-full " width={4000} height={3000}></Image>
          <Image src="/claim/Claim2.jpg" alt="claim instruction" className="w-full " width={4000} height={3000}></Image>
        </div>
      </div>
    </div>
  );
}
