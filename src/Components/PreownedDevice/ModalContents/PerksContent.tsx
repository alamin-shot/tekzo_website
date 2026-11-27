"use client";

/**
 * Perks & Benefits Modal Content
 * Displays the benefits and perks of purchasing pre-owned devices
 */
export default function PerksContent() {
  const perks = [
    {
      icon: "✅",
      title: "Authenticity Guaranteed",
      desc: "Every device is verified for authenticity",
    },
    {
      icon: "🔍",
      title: "Thorough Inspection",
      desc: "70+ point quality check process",
    },
    {
      icon: "🛡️",
      title: "Warranty Included",
      desc: "6 months comprehensive warranty",
    },
    {
      icon: "🔄",
      title: "Easy Returns",
      desc: "7-day hassle-free return policy",
    },
    {
      icon: "🎁",
      title: "Free Accessories",
      desc: "Charging cable and adapter included",
    },
    {
      icon: "💳",
      title: "Flexible Payment",
      desc: "EMI options available",
    },
  ];

  return (
    <div className="space-y-4">
      {perks.map((perk, idx) => (
        <div
          key={idx}
          className="flex items-start gap-4 p-4 bg-gradient-to-br from-teal-50 to-teal-50 rounded-xl border border-teal-200 hover:shadow-md transition-shadow"
        >
          <span className="text-3xl">{perk.icon}</span>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">{perk.title}</h4>
            <p className="text-sm text-gray-600">{perk.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
