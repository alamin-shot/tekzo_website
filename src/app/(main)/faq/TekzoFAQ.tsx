import { HelpCircle } from "lucide-react";
import Title from "@/Components/ReuseableComponent/Title";
import { formatHtml } from "@/lib/formatHtml";
import type { FAQCardProps, FAQColumnProps, TekzoFAQProps } from "@/types/props/content";
import { fieldsOf, filterList, lengthStrict, mapList } from "@/lib/json";
import { idKey, nodeOf } from "@/lib/render";

function FAQCard({ faq: entry, index, lang }: FAQCardProps) {
  // `faq.question` throws for a null entry, as before
  const faq = fieldsOf(entry);
  const isTeal = lang === "en";
  const config = isTeal
    ? {
        iconBg: "bg-teal-100/45",
        iconColor: "text-teal-600",
        border: "border-teal-500",
      }
    : {
        iconBg: "bg-orange-100/45",
        iconColor: "text-primary",
        border: "border-orange-400",
      };

  return (
    <div
      className={`relative bg-[#fbf9ff] rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md h-full flex flex-col ${config.border}`}
    >
      <div className="p-3 lg:p-5 flex flex-col flex-1">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.iconBg}`}
          >
            <HelpCircle className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <p className="text-sm lg:text-base font-semibold bg-linear-to-r from-[#18ac8f] via-[#6baa0b] to-[#e96c27] bg-clip-text text-transparent leading-snug flex-1 min-w-0">
            {nodeOf(faq.question)}
          </p>
        </div>
        <div className="h-px bg-gray-200 my-2 lg:my-4 ml-12" />
        <div
          className="text-sm text-gray-500 leading-relaxed pl-12 pb-1 prose prose-sm max-w-none flex-1 rendered-html"
          dangerouslySetInnerHTML={{ __html: formatHtml(faq.answer) }}
        />
      </div>
    </div>
  );
}

function FAQColumn({ faqs, lang }: FAQColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      {mapList(faqs, (faq, index) => (
        <FAQCard key={idKey(faq)} faq={faq} index={index} lang={lang} />
      ))}
    </div>
  );
}

export default function TekzoFAQ({ faqs = [] }: TekzoFAQProps) {
  // `f.lang` threw for a null entry; fieldsOf keeps that
  const enFaqs = filterList(faqs, (f) => fieldsOf(f).lang === "en");
  const bnFaqs = filterList(faqs, (f) => fieldsOf(f).lang === "bn");

  // Pair up FAQs for equal height rows
  const maxLength = Math.max(enFaqs.length, bnFaqs.length);
  const faqPairs = Array.from({ length: maxLength }, (_, i) => ({
    en: enFaqs[i] || null,
    bn: bnFaqs[i] || null,
  }));

  return (
    <section className="pt-5 lg:pt-10 ">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 lg:mb-12">
          <div className="flex justify-center mb-2">
            <Title>Frequently Asked Questions</Title>
          </div>
          <p className="text-gray-500 text-xs lg:text-sm max-w-md mx-auto">
            Everything you need to know about TEKZO — in English and Bangla.
          </p>
        </div>

        {lengthStrict(faqs) === 0 ? (
          <p className="text-center text-gray-400 py-16">No FAQs available.</p>
        ) : (
          <div className="flex flex-col gap-4 lg:gap-6">
            {faqPairs.map((pair, index) => (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
              >
                {pair.en ? (
                  <FAQCard faq={pair.en} index={index} lang="en" />
                ) : (
                  <div className="hidden lg:block" />
                )}
                {pair.bn ? (
                  <FAQCard faq={pair.bn} index={index} lang="bn" />
                ) : (
                  <div className="hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          Still have questions?{" "}
          <a
            href="mailto:support@tekzo.com.bd?subject=FAQ%20Inquiry"
            className="text-teal-600 hover:underline font-medium"
          >
            Contact our support team
          </a>
        </p>
      </div>
    </section>
  );
}
