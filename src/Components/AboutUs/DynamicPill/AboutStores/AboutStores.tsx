import Image from "next/image";

export default function AboutStores() {
  const offerings = [
    {
      title: "Mobile Accessories",
      description:
        "Brands or Non-Brands Mobile phones, Premium cases (like Pitaka or UAG), fast chargers, and high-end screen protectors.",
    },
    {
      title: "Audio Gear",
      description:
        "A wide range of TWS earbuds, neckbands, and Bluetooth speakers from global brands like Anker, Edifier, and Xiaomi.",
    },
    {
      title: "Smart Home & Lifestyle",
      description: "Smartwatches, power banks, and small smart home devices.",
    },
    {
      title: "Computing",
      description:
        "Occasionally stocks PC peripherals such as gaming mice and mechanical keyboards.",
    },
  ];

  const highlights = [
    {
      title: "Authenticity",
      description:
        "They are often cited as a reliable alternative to smaller, unofficial kiosks, focusing on genuine global brands.",
    },
    {
      title: "Variety",
      description:
        " If you are looking for a specific brand of charger or a durable phone case that isn't available in standard mobile shops, Tekzo usually has it in stock.",
    },
  ];

  return (
    <section className="text-gray-800">
      <div className="">
        {/* --- Hero Section & Core Info --- */}
        <div className="w-full flex flex-col gap-4 lg:gap-6 items-stretch">
          {/* Store Image Wrapper */}
          <div className="w-full relative aspect-[4/2] lg:aspect-[3/1] rounded-2xl overflow-hidden bg-dark border border-gray-100">
            <Image
              src="/store-banner.jpeg"
              alt="Tekzo Store Outlet at Jamuna Future Park"
              width={1200}
              height={400}
              sizes="100vw"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* Core Text Info Card */}
          <div className="w-full flex flex-col justify-between p-4 lg:p-6 2xl:p-8 sm:p-10 rounded-2xl border border-gray-100 bg-dark shadow-sm">
            <div>
              <span className="text-xs font-semibold tracking-widest text-primary/80 uppercase">
                Premium Retailer
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-2 mb-6 text-gray-900">
                Tekzo <span className="text-gray-500 font-light">Store</span>
              </h1>

              <p className="text-gray-800 text-base leading-relaxed mb-4 font-medium">
                Tekzo is a popular gadget and electronics shop located in{" "}
                <span className="text-gray-950 font-bold">
                  Jamuna Future Park
                </span>
                , primarily known for specializing in premium tech accessories
                and mobile gadgets.
              </p>
              <p className="text-gray-800 text-base lg:text-lg leading-relaxed mb-8 font-medium">
                While specific shop numbering can occasionally shift in large
                malls, here is the standard breakdown for Tekzo in Jamuna Future
                Park.
              </p>
            </div>

            {/* Location & Vibe Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-6 pt-6 border-t border-gray-200/80">
              <div>
                <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                  Zone / Block
                </h3>
                <p className="text-sm text-gray-900 font-medium">
                  <span className="text-primary font-bold">Block A</span>{" "}
                  <br />
                  (typically found on Level 4, which is the main hub for
                  electronics and mobile phones).
                </p>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                  Ambiance
                </h3>
                <p className="text-sm text-gray-900 font-medium">
                  The shop usually features a modern, clean, and well-lit
                  "tech-hub" aesthetic, designed for customers to test and feel
                  gadgets before purchasing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- What They Offer Section --- */}
        <div className="space-y-6">
          <div className="flex flex-col items-start mt-4 lg:mt-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              What They Offer
            </h2>
            <div className="h-1.5 w-12 bg-primary mt-2 rounded-full" />
          </div>
          <p className="text-gray-800 text-base leading-relaxed mb-8 font-medium">
            Tekzo is a go-to spot for tech enthusiasts looking for both official
            and high-quality "lifestyle" tech. Their inventory generally
            includes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-6">
            {offerings.map((item, index) => (
              <div
                key={index}
                className="p-4 lg:p-6 rounded-xl border border-gray-100 bg-dark hover:shadow-md transition-all duration-300 shadow-xs"
              >
                <h3 className="text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  {item.title}
                </h3>
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Why People Go There Section --- */}
        <div className="space-y-6">
          <div className="flex flex-col items-start mt-4 lg:mt-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Why People Go There
            </h2>
            <div className="h-1.5 w-12 bg-primary mt-2 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-6">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="p-4 lg:p-6 rounded-xl border border-gray-100 bg-dark hover:shadow-md transition-all duration-300 shadow-xs"
              >
                <h3 className="text-xl font-extrabold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
