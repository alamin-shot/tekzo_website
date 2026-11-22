import Image from "next/image";
import AboutSectionHeading from "../../ReuseableComponent/AboutSectionHeading";
import BrandAuthentication from "./BrandAuthentication";

export default function AboutBrands() {
  const brandOnboarding = [
    {
      id: "01",
      title: "VOLTME",
      description: "Currently we are the exclusive distributor of VOLTME by Shenzhen voltnex innovation LTD. in Bangladesh.",
      tags: ["Wall Charger", "Power Cables", "Car Chargers", "Power Banks", "Power Strips", "Power Station"],
      bannerSrc: "/about-brands/brand-01.webp",
      logoSrc: "/about-brands/voltme.svg",
    },
    {
      id: "02",
      title: "TOZO",
      description: "Experience Innovation and Precision with TOZO – Exclusively Distributed by TEKZO.",
      tags: ["Earbuds", "Open Ear", "Headphones", "Smart Watches", "Speakers"],
      bannerSrc: "/about-brands/brand-02.webp",
      logoSrc: "/about-brands/tozo.svg",
    },
    {
      id: "03",
      title: "FIIL",
      description: "Redefining Sound Excellence with FIIL – Proudly Brought to You by TEKZO.",
      tags: ["OWS", "TWS", "Neckband", "Headphones", "Speakers"],
      bannerSrc: "/about-brands/brand-03.webp",
      logoSrc: "/about-brands/fiil.svg",
    },
  ];
  return (
    <div className="space-y-10 lg:space-y-15">
      {brandOnboarding.map((brand) => (
        <section key={brand.id} className="flex flex-col">
          {/* Header Section */}
          <div className="mb-6">
            <AboutSectionHeading>Brand Onboard - {brand.id}</AboutSectionHeading>
            <p className="text-sm lg:text-lg text-gray-500 mb-2">{brand.description}</p>
            {/* Tags / Categories */}
            <div className="flex flex-wrap text-xs lg:text-base text-gray-400 font-medium">
              {brand.tags.map((tag, index) => (
                <span key={tag}>
                  {tag} {index !== brand.tags.length - 1 && <span className="mx-2">|</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Banner Image with Rounded Corners and Border Decor */}
          <div className="relative w-full h-full rounded-[40px]">
            <Image src={brand.bannerSrc} alt={`${brand.title} banner`} width={4000} height={3000} className="w-full" />
            {/* Decorative white corner lines (Optional) */}
            <div className="absolute inset-4 border border-white/20 rounded-[30px] pointer-events-none" />
          </div>

          {/* Logo Alignment */}
          <div className="flex justify-end mt-4">
            <div className="relative w-32 h-10">
              <Image src={brand.logoSrc} alt={`${brand.title} logo`} fill sizes="128px" className="object-contain object-right" />
            </div>
          </div>
        </section>
      ))}
      <BrandAuthentication></BrandAuthentication>
    </div>
  );
}
