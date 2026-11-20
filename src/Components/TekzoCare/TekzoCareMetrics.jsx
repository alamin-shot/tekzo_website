"use client";

const SKILLS = [
  { name: "iPhone Repair Success", percentage: 92 },
  { name: "iPad & Tablet Repair", percentage: 85 },
  { name: "MacBook & Laptop Service", percentage: 78 },
  { name: "General Tech Diagnostics", percentage: 88 },
];

export default function TekzoCareMetrics() {
  return (
    <section className="py-5 lg:py-10  ">
      {/* ── NEW HEADER STYLE ── */}
      <div className="max-w-4xl mb-8 lg:mb-12 space-y-4">
        <h2 className="text-3xl md:text-4xl  tracking-tight leading-[1.15] font-bold bg-linear-to-r from-[#18ac8f] via-[#6baa0b] to-[#e96c27] bg-clip-text text-transparent ">
          With our knowledgeable repair professionals, <br />
          your device is safe.
        </h2>
      </div>

      {/* ── TWO-COLUMN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Left Column: Split description paragraph with modern subtle accents */}
        <div className="lg:col-span-6 space-y-6 text-gray-600 text-base leading-relaxed">
          <p className="border-l-4 border-primary pl-4 text-gray-900 font-medium text-lg">
            <strong className="font-semibold text-primary">TEKZO Care</strong>{" "}
            uses only genuine or OEM-quality replacement parts and follows
            strict international repair standards.
          </p>

          <p>
            Our technicians are professionally trained and experienced in
            handling complex issues for high-end devices like iPhone 15 Pro Max,
            Galaxy S Series, or iPads. We guarantee clean diagnostics on every
            hardware layer.
          </p>

          <p>
            We offer transparent pricing, fast service, and customer-friendly
            warranties. Backed by TEKZO, one of the most trusted gadget
            retailers in Bangladesh, we guarantee complete peace of mind with
            every repair.
          </p>
        </div>

        {/* Right Column: Sleek Progress bars container */}
        <div className=" lg:col-span-6 bg-dark border border-gray-200 shadow-sm rounded-2xl p-6 lg:p-8 space-y-6">
          {SKILLS.map((skill, index) => (
            <div key={index} className="space-y-2.5">
              {/* Info Label Row */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800 tracking-tight">
                  {skill.name}
                </span>
                <span className="text-xs font-extrabold text-secondary">
                  {skill.percentage}%
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${skill.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
