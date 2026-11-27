import Image from "next/image";
import AboutSectionHeading from "../../ReuseableComponent/AboutSectionHeading";

export default function BrandAuthentication() {
  return (
    <section className="">
      <div className="flex flex-col lg:flex-row justify-between lg:*:flex-6 gap-12 items-center">
        {/* Left Content Column */}
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300">
            {/* Simple Shield Check Icon */}
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          <AboutSectionHeading>Brand Authentication</AboutSectionHeading>

          <h2 className=" text-lg  text-gray-500">
            TEKZO Partner with Voltnex Innovations as Exclusive Distributor in
            Bangladesh.
          </h2>

          <p className="text-gray-600 text-sm lg:text-lg leading-relaxed text-justify">
            <span className="font-medium">[Bangladesh, August 29, 2023]</span> –
            Voltnex Innovations, the visionary tech company behind the esteemed
            VOLTME brand, is excited to announce its strategic partnership with
            TEKZO, a distinguished name in the distribution sector in
            Bangladesh. This partnership is set to reshape the technology
            landscape in Bangladesh, with Salamat TEKZO becoming the exclusive
            distributor for all VOLTME products.
          </p>
        </div>

        {/* Right Certificates Column */}
        <div className="bg-dark rounded-3xl lg:rounded-[40px] p-8 lg:p-12 max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            {/* Top Left Certificate */}
            <div className="shadow-sm rounded-sm transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/about-brands/brand-certicate/c-1.webp"
                alt="VOLTME Authorized Distributor Certificate"
                width={300}
                height={200}
                className="w-full h-auto"
              />
            </div>
            {/* Top Right Certificate */}
            <div className="shadow-sm rounded-sm row-span-2 flex items-center transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/about-brands/brand-certicate/c-3.webp"
                alt="Brand Authorization Certification"
                width={300}
                height={450}
                className="w-full h-auto"
              />
            </div>
            {/* Middle Left Certificate */}
            <div className="shadow-sm rounded-sm transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/about-brands/brand-certicate/c-2.webp"
                alt="Authorized Distributor Certificate Large"
                width={300}
                height={200}
                className="w-full h-auto"
              />
            </div>
            {/* Bottom Right Certificate (Offset or spanned) */}
            <div className="col-start-2 shadow-sm rounded-sm transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/about-brands/brand-certicate/c-4.webp"
                alt="Letter of Authorization"
                width={300}
                height={200}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
