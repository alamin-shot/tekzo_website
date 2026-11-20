import { getSeoPage, getSettings } from "@/lib/api";

export async function generateMetadata() {
  const seoData = await getSeoPage("checkout");
  if (!seoData) {
    return {
      title: "Checkout | TEKZO",
      description: "Complete your purchase securely at TEKZO.",
    };
  }

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.tags
      ? seoData.tags.split(",").map((t) => t.trim())
      : [],
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: `${seoData.canonicalUrl}/checkout`,
      siteName: seoData.siteName,
      images: [
        {
          url: seoData?.ogImage || "/og-default.webp",
          width: 1200,
          height: 630,
          alt: seoData.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.title,
      description: seoData.description,
      images: [
        {
          url: seoData?.ogImage,
          width: 1200,
          height: 630,
          alt: seoData.title,
        },
      ],
    },
    alternates: {
      canonical: `${seoData.canonicalUrl}/checkout`,
    },
  };
}

export default async function CheckoutLayout({ children }) {
  const [seoData, companySetting] = await Promise.all([
    getSeoPage("checkout"),
    getSettings(),
  ]);
  return (
    <>
      {seoData?.banner && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__CHECKOUT_BANNER__=${JSON.stringify(seoData.banner)}`,
          }}
        />
      )}
      {companySetting && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__COMPANY_SETTING__=${JSON.stringify(companySetting)}`,
          }}
        />
      )}
      {children}
    </>
  );
}
