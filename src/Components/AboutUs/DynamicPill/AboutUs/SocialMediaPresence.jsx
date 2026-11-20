import Image from "next/image";
import AboutSectionHeading from "../../ReuseableComponent/AboutSectionHeading";

export default function SocialMediaPresence() {
  return (
    <section className="mt-12 lg:mt-16 flex flex-col lg:flex-row items-center gap-12">
      {/* Left Content */}
      <div className="flex-1 space-y-8">
        <AboutSectionHeading>Social media Presence</AboutSectionHeading>

        <div className="space-y-3 lg:space-y-4 text-gray-800 font-medium text-sm lg:text-base leading-relaxed lg:pr-10">
          <div>
            <span className="font-bold text-gray-900">The Scenario:</span>{" "}
            TEKZO has successfully created a "Digital Storefront" that feels
            like a community. It’s digital-first approach makes them feel much
            larger and more accessible to the modern Bangladeshi shopper. The
            overall scenario of <span className="font-bold text-gray-900">TEKZO’s</span>
            social media presence in Bangladesh is defined by{" "}
            <span className="font-bold text-gray-900">
              high-energy "Hype Marketing"
            </span>{" "}
            and a strong focus on{" "}
            <span className="font-bold text-gray-900">
              trust-building through transparency.
            </span>
          </div>

          <div>
            Operating primarily in the "F-Commerce" (Facebook Commerce)
            landscape, they have successfully moved beyond being just a shop to
            becoming a digital content creator for the tech community.
          </div>

          <div>
            <span className="font-bold text-gray-900">The "Trust First" Strategy:</span>{" "}
            TEKZO’s social media revolves around Live Verification. They
            frequently go live to show the sealing and serial number checks of
            high-end products. They are vocal about the difference between
            "Official" (with local warranty) and "Global" (international)
            versions, which has helped them build a loyal following.
          </div>

          <div>
            <span className="font-bold text-gray-900"> Content Ecosystem:</span> This is
            where the majority of our business happens. Our feed is a mix of
            high-resolution product photography and "Offer Banners." We leverage
            Messenger heavily for one-on-one sales, often closing deals directly
            through chat. Our YouTube channel serves as a library of reviews. By
            providing actual value (how-to guides, comparisons), which position
            ourselves as experts rather than just sellers. On TikTok and
            Instagram Reels, they use fast-paced edits, trending Bengali music,
            and "Unboxing ASMR" to capture the attention of Gen Z buyers.
          </div>
        </div>
      </div>

      {/* Right Image Card */}
      <div className="flex-1 w-full max-w-2xl">
        <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-[#23262B] shadow-2xl">
          <Image
            src="/SocialMediaPresence.webp" // Path to your uploaded creative
            alt="Social Media Presence Graphic"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
