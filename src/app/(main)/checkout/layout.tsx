import { getSeoPage, getSettings } from "@/lib/api";
import type { Metadata } from "next";
import type { LayoutChildrenProps } from "@/types/props/checkout";
import { rec } from "@/lib/json";
import { nodeOf, str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

// Checkout is a private, per-user step — keep it out of search results but
// let crawlers follow its links.
const NOINDEX = { index: false, follow: true, googleBot: { index: false, follow: true } };

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoPage("checkout");
  if (!seoData) {
    return {
      title: "Checkout | TEKZO",
      description: "Complete your purchase securely at TEKZO.",
      robots: NOINDEX,
    };
  }

  const seo = rec(seoData);

  return {
    robots: NOINDEX,
    title: str(seo?.title),
    description: str(seo?.description),
    keywords: seo?.tags
      ? tagsOr(seo.tags, [])
      : [],
    openGraph: {
      title: str(seo?.title),
      description: str(seo?.description),
      url: `${String(seo?.canonicalUrl)}/checkout`,
      siteName: str(seo?.siteName),
      images: [
        {
          url: str(seo?.ogImage) || "/og-default.webp",
          width: 1200,
          height: 630,
          alt: str(seo?.title),
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: str(seo?.title),
      description: str(seo?.description),
      images: [
        {
          url: str(seo?.ogImage) ?? "",
          width: 1200,
          height: 630,
          alt: str(seo?.title),
        },
      ],
    },
    alternates: {
      canonical: `${String(seo?.canonicalUrl)}/checkout`,
    },
  };
}

export default async function CheckoutLayout({ children }: LayoutChildrenProps) {
  const [seoData, companySetting] = await Promise.all([
    getSeoPage("checkout"),
    getSettings(),
  ]);
  return (
    <>
      {nodeOf(rec(seoData)?.banner && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__CHECKOUT_BANNER__=${JSON.stringify(rec(seoData)?.banner)}`,
          }}
        />
      ))}
      {nodeOf(companySetting && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__COMPANY_SETTING__=${JSON.stringify(companySetting)}`,
          }}
        />
      ))}
      {children}
    </>
  );
}
