"use client";

/**
 * FAQ Modal Content
 * Displays frequently asked questions and answers about pre-owned devices
 */
export default function FAQContent() {
  const faqs = [
    {
      q: "What does 'pre-owned' mean?",
      a: "Pre-owned devices are previously used products that have been thoroughly tested, refurbished, and certified for resale.",
    },
    {
      q: "What is your return policy?",
      a: "We offer a 7-day return policy from the date of delivery. The device must be in the same condition as received.",
    },
    {
      q: "Do pre-owned devices come with a warranty?",
      a: "Yes, all our pre-owned devices come with a 6-month comprehensive warranty covering hardware defects.",
    },
    {
      q: "How do you grade device conditions?",
      a: "We use a detailed grading system: Excellent (like new), Good (minor wear), Fair (visible wear but fully functional).",
    },
    {
      q: "Is the battery original?",
      a: "We ensure minimum 80% battery health. Some devices may have battery replacements with genuine parts.",
    },
    {
      q: "Are these devices unlocked?",
      a: "Yes, all devices are carrier unlocked and work with any SIM card.",
    },
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <div
          key={idx}
          className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200"
        >
          <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
            <span className="text-purple-600">Q:</span>
            <span>{faq.q}</span>
          </h4>
          <p className="text-sm text-gray-700 ml-6">{faq.a}</p>
        </div>
      ))}
    </div>
  );
}
