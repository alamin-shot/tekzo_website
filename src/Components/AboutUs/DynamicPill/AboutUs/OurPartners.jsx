import Image from "next/image";

const brands = [
  { name: "Grameenphone", src: "/ecommerce-brand-logo/gp.webp" },
  { name: "Robi", src: "/ecommerce-brand-logo/robi.webp" },
  { name: "City Bank", src: "/ecommerce-brand-logo/city-bank.webp" },
  { name: "SSLCommerz", src: "/ecommerce-brand-logo/ssl.webp" },
  { name: "Bdjobs", src: "/ecommerce-brand-logo/bdjobs.webp" },
  { name: "bKash", src: "/ecommerce-brand-logo/bkash.svg" },
  { name: "Nagad", src: "/ecommerce-brand-logo/nagad.webp" },
];

export default function OurPartners() {
  return (
    <section className="mt-12 lg:mt-16 ">
      <div className="max-w-5xl mx-auto px-4">
        {/* Title matches the light gray, quoted style in your photo */}
        <h2 className="text-2xl md:text-3xl text-center text-gray-500 mb-10 font-light">"Brands we have collaborated with"</h2>

        {/* Flex container to handle the centering and wrapping */}
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
          {brands.map((brand) => (
            <div key={brand.name} className="relative w-32 h-16 transition-transform hover:scale-105">
              <Image src={brand.src} alt={brand.name} fill style={{ objectFit: "contain" }} priority={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
