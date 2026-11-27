import Image from "next/image";
import AboutSectionHeading from "../../ReuseableComponent/AboutSectionHeading";
import { formatHtml } from "@/lib/formatHtml";

const OurFeatures = () => {
  const data = [
    {
      title: "Our Platform",
      content: `
          <p style='line-height: 1.625; white-space: pre-line;'>
            Tekzo operates as a comprehensive e-commerce accelerator and
            digital transformation store, positioning itself as a strategic partner for
            entrepreneurs who want to transition from casual selling to
            professional brand ownership. Tekzo functions as a full-service "growth
            engine" that manages the entire lifecycle of an online business, from
            the initial market research and store architecture to advanced search
            engine optimization and automated fulfillment systems.
          </p>
          <p style='line-height: 1.625; white-space: pre-line;'>
            The core philosophy of the brand is built around the concept of "Smart,
            Scalable Code," which translates to creating digital assets—that are
            built to handle high volume without breaking. Their expertise is deeply
            rooted in the ground of marketplaces, where they don't just "improve" a
            store; they re-engineer it using data-driven insights. This involves
            deep-dive keyword analysis to ensure products appear in the top 1%
            of search results and optimizing the user experience to ensure that
            once a customer clicks, they actually buy.
          </p>
`,
      image: "/about-section-features/platform.webp",
      reverse: false,
    },
    {
      title: "Smooth User Experience",
      content: `
          <p style=' line-height: 1.625; white-space: pre-line;'>
            The Tekzo website delivers a smooth user experience by prioritizing technical performance and
            intuitive design to ensure every visitor’s journey is entirely frictionless. By utilizing a mobile-first
            architecture, the platform guarantees that the interface remains responsive and easy to navigate
            regardless of the device being used, eliminating the common frustrations of clunky layouts or
            difficult-to-tap buttons.
          </p>
          <p style='line-height: 1.625; white-space: pre-line;'>
            Beyond the technical backend, the site integrating direct communication tools like WhatsApp for instant
            support, Tekzo creates a seamless transition from a user’s initial curiosity become an interest, making the
            entire experience feel easy, transparent, and useful.
          </p>
          `,
      image: "/about-section-features/ux.webp",
      reverse: true,
    },
    {
      title: "Career Opportunities",
      content: `<p> 
              Career opportunities at Tekzo are centered around a performance-driven culture that values technical expertise, e-commerce innovation, and data-backed marketing. As a tech business with a global reach, the company seeks individuals who can balance creative thinking with the rigorous requirements of marketplace algorithms.  Evaluating Tekzo as a working environment depends heavily on your professional style, as it offers the typical "high-reward, high-intensity" atmosphere found in e-commerce platform. Because the company operates as a growth partner for platforms like Etsy and TikTok Shop, the environment is fundamentally different from a traditional corporate 9-to-5. 
              </p>`,
      image: "/about-section-features/careerr.webp",
      reverse: false,
    },
    {
      title: "Corporate Deals",
      content: `<p>
              Tekzo is a global digital business platform, their regional corporate deals typically involve helping Bangladeshi manufacturers, startups, and tech developers bridge the gap between local production and international sales. a wide range of high-quality mobile accessories, audio solutions, wearable items, smartphones, home appliances, and computer electronics. Our corporate clients benefit from competitive pricing, priority customer service, and flexible payment options, ensuring seamless procurement and timely delivery. 
              </p>`,
      image: "/about-section-features/corporate.webp",
      reverse: true,
    },
    {
      title: "Affiliate Program",
      content: `
            <p style=' line-height: 1.6; white-space: pre-line;'>
              The <strong style='font-weight: 700;'>Tekzo (TekzoTech)</strong> affiliate model is primarily structured around its <strong style='font-weight: 700;'>"B2B Referral Program"</strong> rather than a traditional automated link-sharing system found on retail sites.
            </p>
            <p style='line-height: 1.6; white-space: pre-line;'>
              By becoming an affiliate, you can earn attractive commissions for every successful referral made
              through your unique affiliate link. This program is designed to create a mutually beneficial
              relationship, where affiliates can grow alongside us while providing customers with access to
              high-quality products.
            </p>
            `,

      image: "/about-section-features/affiliate.webp",
      reverse: false,
    },
    {
      title: "E-Wanrranty",
      content: `
      <p style='line-height: 1.625; white-space: pre-line;'>
        The <strong style='font-weight: 700;'>Tekzo E-Warranty System</strong> is a digital solution designed to replace traditional paper-based
        warranty cards with a seamless, automated tracking process. For a brand that focuses on
        "Smart, Scalable Code," this system is a core part of their "business-in-a-box" offering for
        e-commerce and retail brands. We’ve introduced a hassle-free E-Warranty system to enhance
        customer convenience. Simply scan the QR code provided with the product, and customers can
        claim their warranty online without stepping out of their homes.
      </p>
      `,
      image: "/about-section-features/warranty.webp",
      reverse: true,
    },
    {
      title: "Education Discount",
      content: `<p>
                Whether you’re enhancing your study experience or equipping your classroom with the best technology, we are committed to providing top-quality products at affordable prices. Visit our e-commerce site at www.salamatinnovation.com to explore these special offers and take advantage of our educational discounts. At TEKZO, we believe in supporting education and empowering both students and teachers. To make learning and teaching more accessible, we are offering exclusive discounts on our wide range of mobile accessories and electronics for students and educators.  
                </p>`,
      image: "/about-section-features/corporate.webp",
      reverse: false,
    },
  ];

  return (
    <div className="">
      {data.map((section, index) => (
        <section key={index}>
          <span className="lg:hidden">
            <AboutSectionHeading>{section.title}</AboutSectionHeading>
          </span>
          <div
            className={`flex flex-col-reverse md:flex-row items-center mt-8 lg:mt-0 gap-5 lg:gap-10 xl:gap-15 ${index === data.length - 1 ? "mb-0" : "mb-10"} lg: dp  ${section.reverse ? "lg:flex-row-reverse" : ""}`}
          >
            {/* Text Content */}
            <div className="flex-7">
              <span className="hidden lg:block">
                <AboutSectionHeading>{section.title}</AboutSectionHeading>
              </span>
              <p className="text-gray-800 leading-relaxed text-sm md:text-base font-medium rendered-html" dangerouslySetInnerHTML={{ __html: formatHtml(section.content) }} />
            </div>

            {/* Image Content */}
            <div className="flex-5 w-full">
              <div className="relative ">
                <Image src={section.image} alt={section.title} width={1000} height={800} sizes="(max-width: 768px) 100vw, 40vw" className="w-full h-auto object-cover  rounded-[17%]" />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default OurFeatures;
