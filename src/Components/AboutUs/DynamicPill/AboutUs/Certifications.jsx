"use client";
import Image from "next/image";
import AboutSectionHeading from "../../ReuseableComponent/AboutSectionHeading";

export function CertificationSection() {
  const certifications = [
    { name: "e-Commerce Association of Bangladesh", img: "/certification/cert-1.webp" },
    { name: "Digital Business Identification Number", img: "/certification/cert-2.webp" },
    { name: "Dhaka Chamber of Commerce & Industry", img: "/certification/cert-3.webp" },
    { name: "Import Registration Certificate (IRC) Commercial", img: "/certification/cert-4.webp" },
    { name: "Registrar of Joint Stock Companies And Firms", img: "/certification/cert-5.webp" },
  ];
  return (
    <section className="mt-12 lg:mt-16">
      <AboutSectionHeading>Our Certification’s</AboutSectionHeading>
      <div className="">
        <h2 className="text-2xl lg:text-4xl font-light text-gray-500 my-12 lg:my-16  text-center">&quot;We are certified&quot;</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {certifications.map((cert, index) => (
            <div key={index}>
              {/* 1. Image Container (Must be relative + have height) */}
              <Image src={cert.img} alt={cert.name} width={300} height={200} className="w-full h-auto transition-transform hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
