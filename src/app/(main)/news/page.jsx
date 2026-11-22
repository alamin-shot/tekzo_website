import News from "@/Components/news/News";
import Banner from "@/Components/ReuseableComponent/Banner";
import { getNews } from "@/lib/api";

export async function generateMetadata() {
  const data = await getNews();
  const seo = data?.seoData;

  const title = seo?.title ?? "";
  const description = seo?.description ?? "";
  const keywords = seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [];
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonical = seo?.canonical || `${baseUrl}/news`;
  const ogImage = seo?.ogImage || "/loginPage/contact-about-bg.webp";
  const siteName = seo?.siteName;

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
  const newsData = data?.news ?? [];
  const seoData = data?.seoData ?? {};

  return (
    <div>
      <Banner h1="TEKZO News" image={seoData?.banner || "/all-product-banner.webp"} title={seoData?.title || "Blog"} />
      <News newsData={newsData} />
    </div>
  );
};

export default NewsPage;
