"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import PreFetchLink from "@/Components/ReuseableComponent/CustomUIComponent/PreFetchLink";

export default function HomeFAQ({ customerQuote }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const blueLinkClass = "text-blue-600 hover:text-blue-700 hover:underline font-bold transition-colors";
  // Outbound citation to a manufacturer's official site (named source).
  const OfficialLink = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener" className={blueLinkClass}>
      {children}
    </a>
  );

  const faqs = [
    {
      id: "faq-1",
      question: "Why should I buy phones, laptops and home appliances from TEKZO?",
      answer: (
        <p>
          When it comes to investing in your next smartphone, high-performance{" "}
          <PreFetchLink href="/categories/laptop" className={blueLinkClass}>
            Laptop
          </PreFetchLink>
          ,{" "}
          <PreFetchLink href="/categories/smart-watches" className={blueLinkClass}>
            Smart Gadget
          </PreFetchLink>
          , or{" "}
          <PreFetchLink href="/categories" className={blueLinkClass}>
            Essential Home Appliance
          </PreFetchLink>
          , settling for uncertainty is never an option. At{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>
          , located right at Jamuna Future Park in Dhaka, we eliminate the risks of the gray market by bringing you a 100% genuine, factory-fresh inventory sourced directly from authorized global
          channels. Every device in our catalog—from flagship mobile releases to daily productivity tools—undergoes rigorous verification to guarantee absolute authenticity, complete with official
          warranties. <span className="font-bold">Smart shoppers choose</span>{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>{" "}
          not just for our premium product selection, but for an uncompromising retail experience that includes <span className="font-bold">secure nationwide delivery</span>,{" "}
          <span className="font-bold">parcel inspections</span>, <span className="font-bold">flexible EMI</span> options, and dedicated <span className="font-bold">round-the-clock support</span>. Stop
          compromising on quality and invest in technology you can truly trust—experience the{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>{" "}
          advantage today.
        </p>
      ),
    },
    {
      id: "faq-2",
      question: "Where can I buy genuine gaming smartphones in Bangladesh?",
      answer: (
        <p>
          Step into the ultimate arena of mobile gaming and high-performance tech with{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>
          , Bangladesh’s premier destination for elite gaming smartphones and cutting-edge devices. <span className="font-bold">Located at Jamuna Future Park, Dhaka</span>, we invite you to experience
          a completely risk-free way to upgrade your gear. Say goodbye to gray-market uncertainties and explore an extensive, 100% genuine collection of powerhouse smartphones and specialized{" "}
          <PreFetchLink href="/shop?search=gaming" className={blueLinkClass}>
            Gaming Devices sourced
          </PreFetchLink>{" "}
          directly from authorized channels. Whether you shop online or visit our physical storefront, every device is rigorously verified for absolute authenticity and backed by official warranties.
          Don&#39;t compromise on your performance—secure your next gaming device at{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>{" "}
          today and play without limits.
        </p>
      ),
    },
    {
      id: "faq-3",
      question: "Why do tech enthusiasts buy their phones from TEKZO?",
      answer: (
        <p>
          Discover why tech enthusiasts rely on{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>{" "}
          for their mobile upgrades. Located at Jamuna Future Park, Dhaka, <span className="font-bold">we invite you to explore</span> our expansive collection of smartphones and specialized gaming
          devices completely risk-free. Every single product in our inventory is 100% genuine, factory-fresh, and sourced directly from authorized channels—completely eliminating gray-market doubts.
          Enjoy complete peace of mind with official warranties, secure nationwide delivery, parcel inspections, and flexible payment options. Stop compromising on quality and collect your next
          powerhouse device from{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>{" "}
          today, where absolute authenticity meets ultimate performance.
        </p>
      ),
    },
    {
      id: "faq-4",
      question: "Can I buy genuine laptops and MacBooks on EMI at TEKZO?",
      answer: (
        <div className="space-y-3">
          <p>
            Investing in a{" "}
            <PreFetchLink href="/categories/laptop" className={blueLinkClass}>
              high-performance laptop
            </PreFetchLink>{" "}
            or{" "}
            <PreFetchLink href="/categories/mac" className={blueLinkClass}>
              MacBook
            </PreFetchLink>{" "}
            is a major decision, and finding a reliable source should never be a gamble. At{" "}
            <PreFetchLink href="/" className={blueLinkClass}>
              TEKZO
            </PreFetchLink>
            , we ensure your upgrade path is entirely risk-free by offering 100% genuine, factory-fresh portable workstations and MacBooks sourced directly from authorized global channels.
          </p>
          <p>
            Whether you choose to experience our devices firsthand at our physical storefront or shop effortlessly through our digital platform,{" "}
            <PreFetchLink href="/" className={blueLinkClass}>
              TEKZO
            </PreFetchLink>{" "}
            anticipates and responds directly to evolving market demands. We meticulously curate the latest CPU architectures, high-refresh-rate displays, and specialized creator configurations so you
            always stay ahead of your workflow requirements. Acquire your dream machine without financial strain through our custom-tailored EMI plans and secure digital payment gateways.{" "}
            <PreFetchLink href="/" className={blueLinkClass}>
              TEKZO
            </PreFetchLink>{" "}
            is dedicated to addressing your unique productivity needs with precision, care, and absolute reliability from checkout to delivery and beyond.
          </p>
        </div>
      ),
    },
    {
      id: "faq-5",
      question: "Does TEKZO offer competitive prices on Apple and Samsung devices?",
      answer: (
        <div className="space-y-3">
          <p>
            When it comes to investing in high-performance technology like Apple MacBooks, flagship iPhones, Samsung Galaxy powerhouses, and cutting-edge gear, smart shoppers know that price
            matters—but trust matters more. At{" "}
            <PreFetchLink href="/" className={blueLinkClass}>
              TEKZO
            </PreFetchLink>
            , we redefine the retail standard by bridging the gap between top-tier global innovation and unbeatable value in the Bangladesh market.
          </p>
          <p>
            We believe that upgrading to world-class tech should never mean breaking the bank or compromising on authenticity. That is why{" "}
            <PreFetchLink href="/" className={blueLinkClass}>
              TEKZO
            </PreFetchLink>{" "}
            is committed to delivering the most competitive, market-leading pricing across our entire catalog of premium smartphones, laptops, and gadgets, completely cutting out unnecessary middlemen
            and gray-market risks.
          </p>
          <p>
            When it&#39;s{" "}
            <PreFetchLink href="/" className={blueLinkClass}>
              TEKZO
            </PreFetchLink>
            , you are investing in a seamless, risk-free retail experience built on clear pillars of value and reliability:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-1">
            <li className="leading-relaxed">
              <span className="font-bold">Unbeatable Market Pricing:</span> Enjoy the lowest competitive prices in Bangladesh on genuine{" "}
              <PreFetchLink href="/brands/apple" className={blueLinkClass}>
                Apple
              </PreFetchLink>
              ,{" "}
              <PreFetchLink href="/brands/samsung" className={blueLinkClass}>
                Samsung
              </PreFetchLink>
              , and elite tech ecosystems, ensuring maximum value for your hard-earned money.
            </li>
            <li className="leading-relaxed">
              <span className="font-bold">Factory-Fresh Authenticity:</span> Every device is sourced directly through authorized channels and comes with official manufacturer warranties—zero
              replicas, uncertainty. Manufacturer warranty terms are published on the{" "}
              <OfficialLink href="https://www.apple.com">Apple</OfficialLink>,{" "}
              <OfficialLink href="https://www.samsung.com">Samsung</OfficialLink> and{" "}
              <OfficialLink href="https://www.anker.com">Anker</OfficialLink> official websites.
            </li>
            <li className="leading-relaxed">
              <span className="font-bold">Seamless Shopping Experience:</span> Access our collection effortlessly through our secure online platform or visit our physical retail presence to experience
              your next device firsthand with expert consultation.
            </li>
            <li className="leading-relaxed">
              <span className="font-bold">Complete After-Sales Protection:</span> Shop with total peace of mind backed by secure nationwide delivery, parcel inspections, flexible EMI options, and
              around-the-clock customer support.
            </li>
          </ul>
          <p>
            Stop settling for inflated prices or unverified sellers.{" "}
            <PreFetchLink href="/" className={blueLinkClass}>
              TEKZO
            </PreFetchLink>
            —where elite performance, lowest-market pricing, and absolute authenticity converge to elevate your digital lifestyle.
          </p>
        </div>
      ),
    },
    {
      id: "faq-6",
      question: "What chargers, power banks and audio accessories does TEKZO sell?",
      answer: (
        <div className="space-y-3">
          <p>
            Your digital lifestyle doesn&#39;t stop at your smartphone or laptop—it thrives on the seamless ecosystem of accessories that power, protect, and amplify your daily routine. At{" "}
            <PreFetchLink href="/" className={blueLinkClass}>
              TEKZO
            </PreFetchLink>
            , we recognize that high-performance devices demand equally exceptional companion gear. That is why we curate a comprehensive, elite lineup of world-class chargers, power solutions,
            immersive audio gear, and smart wearables designed to keep you connected, energized, and ahead of the curve.
          </p>
          <p>
            From ultra-fast{" "}
            <PreFetchLink href="/categories/wall-charger" className={blueLinkClass}>
              GaN chargers
            </PreFetchLink>{" "}
            and high-capacity power banks (featuring trusted global names like{" "}
            <PreFetchLink href="/brands/anker" className={blueLinkClass}>
              Anker
            </PreFetchLink>{" "}
            and{" "}
            <PreFetchLink href="/brands/voltme" className={blueLinkClass}>
              Voltme
            </PreFetchLink>
            ) to crystal-clear wireless earbuds and advanced smartwatches, every accessory in our catalog is strictly verified for 100% authenticity. We bridge the gap between innovation and
            accessibility, ensuring you never have to settle for sub-par quality or unverified replicas. Elevate your everyday carry and complete your device ecosystem with accessories built to
            perform, protect, and last.
          </p>
        </div>
      ),
    },
    {
      id: "faq-7",
      question: "Which home appliances can I buy at TEKZO?",
      answer: (
        <p>
          the appliances that simplify your daily routine and transform your home into a smart, efficient sanctuary. At{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>
          , we bring our signature commitment of 100% authenticity and reliability to your household, offering a curated selection of{" "}
          <PreFetchLink href="/categories" className={blueLinkClass}>
            Bangladesh&#39;s most sought-after home appliances
          </PreFetchLink>{" "}
          designed to elevate your lifestyle. Revolutionize your kitchen with our{" "}
          <PreFetchLink href="/categories/air-fryer" className={blueLinkClass}>
            best-selling air fryers
          </PreFetchLink>{" "}
          that deliver healthy, <span className="font-bold">oil-free meals</span> effortlessly, and keep your wardrobe sharp using our powerful, fast-heating{" "}
          <PreFetchLink href="/categories/steamer-iron" className={blueLinkClass}>
            handheld irons
          </PreFetchLink>{" "}
          and garment steamers. Beat the warm weather with our premium{" "}
          <PreFetchLink href="/categories/desk-fan" className={blueLinkClass}>
            portable desk fans
          </PreFetchLink>{" "}
          engineered for whisper-quiet airflow, and streamline your household chores with high-efficiency{" "}
          <PreFetchLink href="/categories/washing-machine" className={blueLinkClass}>
            washing machines
          </PreFetchLink>{" "}
          offering smart fabric care and powerful cleaning cycles. When you choose{" "}
          <PreFetchLink href="/categories" className={blueLinkClass}>
            home appliances
          </PreFetchLink>{" "}
          from{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>
          , you are investing in absolute peace of mind with <span className="font-bold">100% genuine</span> ring effortless innovation and modern comfort homes with{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>
          —where smart living meets trusted quality.
        </p>
      ),
    },
    {
      id: "faq-8",
      question: "Can I find rare or hard-to-find gadgets at TEKZO?",
      answer: (
        <p>
          When building the ultimate digital lifestyle, having access to variety shouldn&#39;t mean compromising on authenticity or availability. At{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>
          , we pride ourselves on housing one of <span className="font-bold">Bangladesh’s most comprehensive catalogs of verified tech</span> essentials, ensuring that whatever you are searching for,
          you can find it under one trusted roof. We are renowned for offering an <span className="font-bold">expansive inventory</span> that goes far beyond the ordinary, featuring a massive stock of
          the country&#39;s absolute best-selling devices alongside a maximum quantity of rare, specialized gear that is often nearly impossible to source elsewhere in the local market. Whether you
          are hunting for niche gaming hardware, hard-to-find regional variants, or top-tier daily tech accessories in high volume, our catalog is continuously updated to match the pulse of modern
          demand. Every item in our massive inventory undergoes strict verification, ensuring that even the rarest finds are <span className="font-bold">100% factory-fresh</span> and backed by
          official guarantees. Explore{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO’s
          </PreFetchLink>{" "}
          vast, verified collection today and secure the exact tech you want with complete peace of mind, secure nationwide delivery, and unmatched reliability.
        </p>
      ),
    },
    {
      id: "faq-9",
      question: "What is the TEKZO Buyer’s Assurance?",
      answer: (
        <p>
          Total peace of mind should be standard with every tech investment, not an afterthought. At{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>
          , our Buyer’s Assurance is built on an <span className="font-bold">unwavering commitment</span> to your absolute trust and satisfaction, ensuring that buying premium electronics is entirely{" "}
          <span className="font-bold">risk-free</span>, <span className="font-bold">transparent</span>, and <span className="font-bold">rewarding</span>. Every step of your journey with us—from
          browsing our verified inventory to unboxing your device—is safeguarded by rigorous quality checks, official warranties, and dedicated customer support. Whether you choose to order online or
          visit our retail location, we stand behind every product we sell with <span className="font-bold">secure nationwide delivery</span>, <span className="font-bold">tamper-proof packaging</span>
          , and <span className="font-bold">flexible payment</span> solutions designed to put you first. Experience a new standard of retail reliability with{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>
          , where your investment is always fully protected.
          {customerQuote && (
            <>
              {" "}
              As customer <cite className="not-italic font-bold">{customerQuote.author}</cite> wrote in a {customerQuote.rating}/5 review of the{" "}
              <PreFetchLink href={`/product/${customerQuote.productSlug}`} className={blueLinkClass}>
                {customerQuote.productName}
              </PreFetchLink>
              : <q className="italic">{customerQuote.text}</q>
            </>
          )}
        </p>
      ),
    },
    {
      id: "faq-10",
      question: "What makes TEKZO different from other tech shops?",
      answer: (
        <p>
          Technology moves fast, but true trust is built to last.{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>{" "}
          is more than just a{" "}
          <PreFetchLink href="/shop" className={blueLinkClass}>
            retail destination or Online Shop
          </PreFetchLink>
          —it is your definitive tech partner in Bangladesh, engineered to eliminate every doubt, risk, and compromise from your digital journey. When you choose us, you aren&#39;t just buying a
          device; you are investing in absolute authenticity, unbeatable market pricing, and a retail experience that puts your peace of mind above all else. Stop settling for uncertainty, inflated
          costs, or gray-market imitations. Step into confidence, elevate your daily performance, and experience the ultimate standard of retail excellence with{" "}
          <PreFetchLink href="/" className={blueLinkClass}>
            TEKZO
          </PreFetchLink>{" "}
          today.
        </p>
      ),
    },
  ];

  const renderFaqCard = (faq, index) => {
    const isOpen = openIndex === index;

    return (
      <div
        key={faq.id}
        className={`break-inside-avoid mb-3.5 lg:mb-4 rounded-2xl md:rounded-3xl transition-all duration-300 bg-gradient-to-br from-secondary/20 to-secondary/5  ${
          isOpen ? "border-secondary/40 shadow-md ring-1 ring-secondary/25" : "border-secondary/20 hover:border-secondary/35 shadow-xs hover:shadow-md"
        }`}
      >
        <h3 className="m-0">
        <button
          type="button"
          onClick={() => toggleAccordion(index)}
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${index}`}
          id={`faq-trigger-${index}`}
          className="w-full flex items-start justify-between gap-3 p-4 md:p-5 text-left cursor-pointer group select-none transition-colors"
        >
          <div className="flex items-start gap-3 min-w-0">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
                isOpen ? "bg-secondary text-white shadow-sm" : "bg-white/80 text-secondary shadow-xs group-hover:bg-white group-hover:scale-105"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
            </span>
            <span className={`text-sm md:text-base font-bold leading-snug transition-colors ${isOpen ? "text-secondary" : "text-gray-900 group-hover:text-secondary"}`}>{faq.question}</span>
          </div>
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-1 transition-all duration-300 ${
              isOpen ? "bg-secondary text-white rotate-180 shadow-xs" : "bg-white/70 text-gray-500 group-hover:text-secondary group-hover:bg-white rotate-0 shadow-xs"
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        </button>
        </h3>

        {/* Smooth CSS Grid Transition */}
        <div
          id={`faq-answer-${index}`}
          role="region"
          aria-labelledby={`faq-trigger-${index}`}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="px-4 md:px-5 pb-5 pt-2 text-xs md:text-sm text-gray-700 leading-relaxed border-t border-secondary/15">{faq.answer}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section>
      {/* Section Header */}
      <div className="text-center mb-8 lg:mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          Frequently Asked <span className="text-secondary">Questions</span> (FAQs)
        </h2>
        <p className="text-xs md:text-base text-gray-600 max-w-2xl mx-auto px-4">Everything you need to know about our genuine tech, official warranties, and seamless customer care at TEKZO.</p>
      </div>

      {/* One list for all screens: 1 column on mobile, 2 CSS columns on desktop
          (FAQs 1-5 left, 6-10 right). Rendering it twice for mobile/desktop
          doubled the page's word count for crawlers. */}
      <div className="lg:columns-2 lg:gap-5">{faqs.map((faq, index) => renderFaqCard(faq, index))}</div>

    </section>
  );
}
