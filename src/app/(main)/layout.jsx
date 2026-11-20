import { getSettings } from "@/lib/api";
import FooterPage from "@/Components/Footer/FooterPage";
import WhatsAppPopUp from "@/Components/WhatsAppPopUp/WhatsAppPopUp";
import CompanyJsonLd from "@/Components/SEO/CompanyJsonLd";
import GTM from "@/Components/GTM/GTM";
import Navbar2 from "@/Components/Navbar/Navbar2";
import NavbarVisibilityWrapper from "@/Components/Navbar/NavbarVisibilityWrapper";
// app/page.js (home)
export async function generateMetadata() {
  const setting = await getSettings();
  const seo = setting?.seoData || {};

  const base = seo?.canonical || (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

  const title = seo?.title || "TEKZO - Authorised & Multi-Brand Tech Store";
  const siteName = seo?.siteName || "Tekzo";
  const description = seo?.description || "Gadgets and Tech Distributor in Bangladesh";

  const ogImage = seo?.ogImage || `${base}/logo.png`;

  // Keywords (optional)
  const keywords = seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [];

  return {
    // Title system (global template)
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },

    description,
    keywords,

    //  Prevent crash
    metadataBase: new URL(base),

    // Other ai train and search stop
    other: {
      "content-signal": "search=yes,ai-train=no",
    },

    //  Canonical
    alternates: {
      canonical: base,
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
      icon: setting?.company_icon
        ? [
            {
              url: setting.company_icon,
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
          url: setting?.company_icon || "/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
  };
}

export default async function MainLayout({ children }) {
  const companySetting = await getSettings();
  return (
    <div className="bg-[#D9D7D7]">
      <GTM />
      {/* Structured Data JSON-LD */}

      <CompanyJsonLd companySetting={companySetting} seo={companySetting?.seoData} />

      <NavbarVisibilityWrapper>
        <Navbar2 companySetting={companySetting} />
      </NavbarVisibilityWrapper>
      <main className="grow p-3 md:px-5 lg:px-7 xl:px-10 ">{children}</main>

      <FooterPage companySetting={companySetting} />
      <WhatsAppPopUp companySetting={companySetting}></WhatsAppPopUp>
    </div>
  );
}
