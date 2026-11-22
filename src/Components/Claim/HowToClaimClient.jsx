"use client";
import Banner from "@/Components/ReuseableComponent/Banner";
import { useState } from "react";
import { CheckCircle, Info, AlertCircle } from "lucide-react";
import Link from "next/link";
import Title from "../ReuseableComponent/Title";

// Translation content
const translations = {
  en: {
    banner: "How to Claim Warranty",
    title: "Warranty Claim Process",
    subtitle: "Follow these simple steps to claim your warranty",
    langToggle: "বাংলা",
    steps: [
      {
        number: "01",
        title: "Enter IMEI/SL Number",
        description:
          "Visit the claim warranty page and enter your product's IMEI or Serial Number (SL) in the first input field.",
        tips: [
          "Find your IMEI/SL number on the product box or device settings",
          "Ensure the number is entered correctly without spaces",
          "Keep your purchase invoice ready for reference",
        ],
      },
      {
        number: "02",
        title: "Describe the Issue",
        description:
          "In the 'Reason of Claim' field, provide a detailed description of the problem you're experiencing with the product.",
        tips: [
          "Be specific about the issue (e.g., battery not charging, screen flickering)",
          "Mention when the problem started",
          "Include any error messages or unusual behavior",
        ],
      },
      {
        number: "03",
        title: "Verify Your Product",
        description:
          "Click the 'Verify' button to check if your product is eligible for warranty claim. Our system will validate your IMEI/SL number.",
        tips: [
          "Make sure you're connected to the internet",
          "Wait for the verification process to complete",
          "If verification fails, double-check your IMEI/SL number",
        ],
      },
      {
        number: "04",
        title: "Review Product Information",
        description:
          "If your product is verified successfully, you'll see the product information and warranty status displayed on the screen.",
        tips: [
          "Check if the product details match your device",
          "Verify the warranty expiration date",
          "Review the warranty terms and conditions",
        ],
      },
      {
        number: "05",
        title: "Submit Warranty Claim",
        description:
          "After reviewing the product information, click the 'Claim Your Warranty Now' button to submit your warranty claim request.",
        tips: [
          "Ensure all information is correct before submitting",
          "You'll receive a confirmation after submission",
          "Keep track of your claim reference number",
        ],
      },
    ],
    importantNotes: {
      title: "Important Notes",
      notes: [
        "Keep your original purchase invoice ready - you may need to provide it",
        "Warranty claims are subject to terms and conditions",
        "Processing time may vary depending on the issue",
        "Physical damage may not be covered under standard warranty",
        "Contact customer support if you face any issues during the process",
      ],
    },
    needHelp: {
      title: "Need Help?",
      description:
        "If you're having trouble with the warranty claim process, please contact our support team.",
      button: "Contact Support",
    },
    startClaim: "Start Your Claim",
    backHome: "Back to Home",
  },
  bn: {
    banner: "ওয়ারেন্টি ক্লেইম করার পদ্ধতি",
    title: "ওয়ারেন্টি ক্লেইম প্রক্রিয়া",
    subtitle: "আপনার ওয়ারেন্টি ক্লেইম করতে এই সহজ ধাপগুলি অনুসরণ করুন",
    langToggle: "English",
    steps: [
      {
        number: "০১",
        title: "IMEI/SL নম্বর লিখুন",
        description:
          "ওয়ারেন্টি ক্লেইম পেজে যান এবং প্রথম ইনপুট ফিল্ডে আপনার পণ্যের IMEI বা সিরিয়াল নম্বর (SL) লিখুন।",
        tips: [
          "পণ্যের বক্স বা ডিভাইস সেটিংসে আপনার IMEI/SL নম্বর খুঁজুন",
          "নম্বরটি সঠিকভাবে এবং কোনো স্পেস ছাড়া লেখা নিশ্চিত করুন",
          "রেফারেন্সের জন্য আপনার ক্রয় চালান প্রস্তুত রাখুন",
        ],
      },
      {
        number: "০২",
        title: "সমস্যার বিবরণ দিন",
        description:
          "'Reason of Claim' ফিল্ডে, আপনি পণ্যের সাথে যে সমস্যার সম্মুখীন হচ্ছেন তার বিস্তারিত বিবরণ দিন।",
        tips: [
          "সমস্যা সম্পর্কে সুনির্দিষ্ট হন (যেমন, ব্যাটারি চার্জ হচ্ছে না, স্ক্রিন ফ্লিকার করছে)",
          "সমস্যা কখন শুরু হয়েছিল তা উল্লেখ করুন",
          "কোনো ত্রুটি বার্তা বা অস্বাভাবিক আচরণ অন্তর্ভুক্ত করুন",
        ],
      },
      {
        number: "০৩",
        title: "আপনার পণ্য যাচাই করুন",
        description:
          "আপনার পণ্য ওয়ারেন্টি ক্লেইমের জন্য যোগ্য কিনা তা পরীক্ষা করতে Verify বাটনে ক্লিক করুন। আমাদের সিস্টেম আপনার IMEI/SL নম্বর যাচাই করবে।",
        tips: [
          "নিশ্চিত করুন যে আপনি ইন্টারনেটের সাথে সংযুক্ত আছেন",
          "যাচাই প্রক্রিয়া সম্পূর্ণ হওয়ার জন্য অপেক্ষা করুন",
          "যাচাই ব্যর্থ হলে, আপনার IMEI/SL নম্বর ডাবল-চেক করুন",
        ],
      },
      {
        number: "০৪",
        title: "পণ্যের তথ্য পর্যালোচনা করুন",
        description:
          "আপনার পণ্য সফলভাবে যাচাই হলে, আপনি স্ক্রিনে পণ্যের তথ্য এবং ওয়ারেন্টি স্ট্যাটাস দেখতে পাবেন।",
        tips: [
          "পণ্যের বিবরণ আপনার ডিভাইসের সাথে মিলছে কিনা তা পরীক্ষা করুন",
          "ওয়ারেন্টি মেয়াদ শেষ হওয়ার তারিখ যাচাই করুন",
          "ওয়ারেন্টির শর্তাবলী পর্যালোচনা করুন",
        ],
      },
      {
        number: "০৫",
        title: "ওয়ারেন্টি ক্লেইম জমা দিন",
        description:
          "পণ্যের তথ্য পর্যালোচনা করার পর, আপনার ওয়ারেন্টি ক্লেইম অনুরোধ জমা দিতে 'এখনই আপনার ওয়ারেন্টি ক্লেইম করুন' বোতামে ক্লিক করুন।",
        tips: [
          "জমা দেওয়ার আগে সমস্ত তথ্য সঠিক কিনা নিশ্চিত করুন",
          "জমা দেওয়ার পরে আপনি একটি নিশ্চিতকরণ পাবেন",
          "আপনার ক্লেইম রেফারেন্স নম্বর ট্র্যাক করুন",
        ],
      },
    ],
    importantNotes: {
      title: "গুরুত্বপূর্ণ নোট",
      notes: [
        "আপনার মূল ক্রয় চালান প্রস্তুত রাখুন - আপনাকে এটি প্রদান করতে হতে পারে",
        "ওয়ারেন্টি ক্লেইম শর্তাবলীর অধীন",
        "সমস্যার উপর নির্ভর করে প্রক্রিয়াকরণ সময় ভিন্ন হতে পারে",
        "শারীরিক ক্ষতি স্ট্যান্ডার্ড ওয়ারেন্টির আওতায় নাও পড়তে পারে",
        "প্রক্রিয়া চলাকালীন কোনো সমস্যার সম্মুখীন হলে গ্রাহক সহায়তার সাথে যোগাযোগ করুন",
      ],
    },
    needHelp: {
      title: "সাহায্য প্রয়োজন?",
      description:
        "আপনি যদি ওয়ারেন্টি ক্লেইম প্রক্রিয়ায় সমস্যায় পড়ে থাকেন, তাহলে আমাদের সহায়তা টিমের সাথে যোগাযোগ করুন।",
      button: "সাপোর্টের সাথে যোগাযোগ করুন",
    },
    startClaim: "আপনার ক্লেইম শুরু করুন",
    backHome: "হোমে ফিরে যান",
  },
};

export default function HowToClaimClient({ seoData }) {
  const [language, setLanguage] = useState("en");
  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  return (
    <div className="min-h-screen ">
      <Banner h1="How to Claim Your Warranty"
        image={seoData?.banner || "/loginPage/contact-about-bg.webp"}
        title={seoData?.title || t.banner}
      />

      <div className="bg-dark my-mt my-rounded">
        <div className="max-w-5xl mx-auto px-4 py-12 pt-22 md:py-16 relative">
          <div className="lg:hidden absolute right-4 top-4">
            <button
              onClick={toggleLanguage}
              className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              {t.langToggle}
            </button>
          </div>
          {/* Header Section */}
          <div className="text-center mb-12 relative">
            <div className="flex justify-center mb-2">
              <Title> {t.title}</Title>
            </div>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              {t.subtitle}
            </p>
            {/* Language Toggle Button - Fixed Position */}
            <div className="hidden lg:block absolute right-0 top-0">
              <button
                onClick={toggleLanguage}
                className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                {t.langToggle}
              </button>
            </div>
          </div>

          {/* Steps Section */}
          <div className="space-y-4 lg:space-y-6 mb-12">
            {t.steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Tips */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-start gap-2 mb-2">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="font-medium text-blue-900 text-sm">
                          {language === "en" ? "Tips:" : "টিপস:"}
                        </span>
                      </div>
                      <ul className="space-y-2 ml-7">
                        {step.tips.map((tip, tipIndex) => (
                          <li
                            key={tipIndex}
                            className="text-sm text-blue-800 flex items-start gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Important Notes Section */}
          <div className="bg-amber-50 rounded-2xl p-6 md:p-8 border border-amber-100 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <h2 className="text-2xl font-bold text-amber-900">
                {t.importantNotes.title}
              </h2>
            </div>
            <ul className="space-y-3">
              {t.importantNotes.notes.map((note, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-amber-900"
                >
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm md:text-base">{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Need Help Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-center text-white mb-8">
            <h2 className="text-2xl font-bold mb-2">{t.needHelp.title}</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              {t.needHelp.description}
            </p>
            <Link
              href="/contact-us"
              className="inline-block bg-white text-gray-900 px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all shadow-lg"
            >
              {t.needHelp.button}
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/claim-your-warranty">
              <button className="w-full sm:w-auto px-8 py-4 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 active:scale-[0.99] transition-all shadow-lg text-base">
                {t.startClaim}
              </button>
            </Link>
            <Link href="/">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all text-base">
                {t.backHome}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
