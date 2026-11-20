export default function MarketPresenceContent() {
  const ecosystemItems = [
    {
      title: "Next-Gen Digital Storefronts",
      text: "Powered by data-driven technology, our e-commerce platforms offer intuitive navigation, ultra-secure payment gateways, and highly optimized search capabilities, making premium shopping effortless for global consumers.",
    },
    {
      title: "Global Marketplace Footprint",
      text: "Beyond standalone web stores, our retail presence thrives across high-traffic global marketplaces—including Etsy, eBay, Faire, and TikTok Shop. We leverage advanced marketplace optimization (MPO) and targeted social commerce to meet buyers exactly where they prefer to shop.",
    },
    {
      title: "Agile Fulfillment Networks",
      text: "To ensure customer loyalty, our retail presence is backed by smart supply chains, automated order processing, and reliable logistics networks built to handle lightning-fast deliveries and hassle-free returns.",
    },
  ];

  return (
    <section className="w-full text-gray-800">
      <div className=" space-y-4 2xl:space-y-6">
        {/* --- Header Section --- */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-800 leading-tight">
            Our Market Presence:{" "}
            <span className="text-gray-500 font-normal">
              Shaping the Future of Technology & Innovation
            </span>
          </h2>
          <div className="inline-block h-1.5 w-16 bg-primary rounded-full" />
          <p className="text-gray-800 text-base lg:text-lg leading-relaxed pt-2 font-medium">
            At <span className="text-gray-950 font-bold">Tekzo</span>, our
            market presence is defined by reliability, innovation, and a
            relentless commitment to excellence. We have established ourselves
            as a trusted name by bridging the gap between cutting-edge
            technology and real-world solutions, empowering both individual
            consumers and enterprises to thrive in a digital-first era.
          </p>
        </div>

        {/* --- Global Vision Section --- */}
        <div className="p-4 lg:p-8 rounded-2xl border border-gray-100 bg-dark shadow-sm">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Global Vision, Local Impact
          </h3>
          <p className="text-gray-800 text-base leading-relaxed font-medium">
            We operate with a strategic mindset that combines international
            standards with deeply rooted local expertise. Our strong market
            footprint enables us to understand evolving industry trends and
            swiftly adapt to the unique needs of our diverse clientele. Whether
            delivering premium technology products or driving robust digital
            transformations, Tekzo is synonymous with quality and trust.
          </p>
        </div>

        {/* --- Omnichannel Ecosystem Section --- */}
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              An Advanced Omnichannel Ecosystem
            </h3>
            <p className="text-gray-800 text-base leading-relaxed max-w-4xl font-medium">
              We understand that the modern shopper demands flexibility, speed,
              and reliability. To meet these expectations, Tekzo has established
              a robust multi-channel retail infrastructure that delivers a
              unified shopping experience:
            </p>
          </div>

          {/* Ecosystem Feature Cards Line */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-stretch">
            {ecosystemItems.map((item, index) => (
              <div
                key={index}
                className="p-4 lg:p-6 rounded-2xl border border-gray-100 bg-dark shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300"
              >
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
