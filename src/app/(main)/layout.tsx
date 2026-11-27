import type { Metadata } from "next";
import type { LayoutProps } from "@/types/props/layout";
import { getSettings } from "@/lib/api";
import dynamic from "next/dynamic";
import FooterPage from "@/Components/Footer/FooterPage";
import CompanyJsonLd from "@/Components/SEO/CompanyJsonLd";
import GTM from "@/Components/GTM/GTM";
import WebVitalsReporter from "@/Components/GTM/WebVitalsReporter";
import Navbar2 from "@/Components/Navbar/Navbar2";
import NavbarVisibilityWrapper from "@/Components/Navbar/NavbarVisibilityWrapper";
import { rec, requireString } from "@/lib/json";
import { str } from "@/lib/render";

const WhatsAppPopUp = dynamic(() => import("@/Components/WhatsAppPopUp/WhatsAppPopUp"));
// app/page.js (home)
export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSettings();
  const seo = rec(rec(setting)?.seoData || {});

  // (String() is the conversion `new URL(base)` and the template strings
  // below already applied.)
  const base = String(seo?.canonical || (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, ""));

  const title = str(seo?.title) || "TEKZO - Authorised & Multi-Brand Tech Store";
  const siteName = str(seo?.siteName) || "Tekzo";
  const description = str(seo?.description) || "Gadgets and Tech Distributor in Bangladesh";

  const ogImage = str(seo?.ogImage) || `${base}/logo.png`;

  // Keywords (optional)
  const keywords = seo?.tags
    ? requireString(seo.tags)
        .split(",")
        .map((t) => t.trim())
    : [];

  const companyIcon = str(rec(setting)?.company_icon);

  return {
    // Title system (global template)
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },

    description,
    keywords,

    // Author signals: <meta name="author">, <link rel="author">, creator/publisher.
    // The store itself is the author of its pages; /about-us says who that is.
    authors: [{ name: siteName, url: `${base}/about-us` }],
    creator: siteName,
    publisher: siteName,

    //  Prevent crash
    metadataBase: new URL(base),

    // Other ai train and search stop
    other: {
      "content-signal": "search=yes,ai-train=no",
    },

    //  Canonical
    alternates: {
      // "./" resolves to each page's own path (against metadataBase), so pages
      // without their own canonical point to themselves instead of the homepage.
      canonical: "./",
    },

    // OpenGraph (Facebook, LinkedIn)
    openGraph: {
      type: "website",
      locale: "en_US",
      url: base,
      siteName,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },

    //  Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },

    // Icons
    icons: {
      icon: companyIcon
        ? [
            {
              url: companyIcon,
              type: "image/png",
            },
          ]
        : [
            { url: "/favicon.ico" },
            {
              url: "/favicon-16x16.png",
              sizes: "16x16",
              type: "image/png",
            },
            {
              url: "/favicon-32x32.png",
              sizes: "32x32",
              type: "image/png",
            },
          ],

      apple: [
        {
          url: companyIcon || "/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
  };
}

export default async function MainLayout({ children }: LayoutProps) {
  const companySetting = await getSettings();
  return (
    <div className="bg-[#D9D7D7]">
      <GTM />
      <WebVitalsReporter />
      {/* Structured Data JSON-LD */}

      <CompanyJsonLd companySetting={companySetting} seo={rec(companySetting)?.seoData} />

      <NavbarVisibilityWrapper>
        <Navbar2 companySetting={companySetting} />
      </NavbarVisibilityWrapper>
      <main className="grow p-3 md:px-5 lg:px-7 xl:px-10 ">{children}</main>

      <FooterPage companySetting={companySetting} />
      <WhatsAppPopUp companySetting={companySetting}></WhatsAppPopUp>
    </div>
  );
}
