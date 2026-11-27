import News from "@/Components/news/News";
import Banner from "@/Components/ReuseableComponent/Banner";
import { getNews } from "@/lib/api";
import type { Metadata } from "next";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getNews();
  const seo = rec(rec(data)?.seoData);

  const title = str(seo?.title) ?? "";
  const description = str(seo?.description) ?? "";
  const keywords = tagsOr(seo?.tags, []);
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonical = str(seo?.canonical) || `${baseUrl}/news`;
  const ogImage = str(seo?.ogImage) || "/loginPage/contact-about-bg.webp";
  const siteName = str(seo?.siteName);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

const NewsPage = async () => {
  const data = await getNews();
  const newsData = rec(data)?.news ?? [];
  const seoData = rec(rec(data)?.seoData ?? {});

  return (
    <div>
      <Banner h1="TEKZO News" image={seoData?.banner || "/all-product-banner.webp"} title={seoData?.title || "Blog"} />
      <News newsData={newsData} />
    </div>
  );
};

export default NewsPage;
