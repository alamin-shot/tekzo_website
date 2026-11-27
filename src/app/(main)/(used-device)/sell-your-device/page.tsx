import Banner from "@/Components/ReuseableComponent/Banner";
import SellYourDeviceContent from "@/Components/SellYourDevice/SellYourDeviceContent";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import { cookies } from "next/headers";
import { getSeoPage } from "@/lib/api";
import type { Metadata } from "next";
import { rec } from "@/lib/json";
import { str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

export const revalidate = 3600;

const FALLBACK_TITLE = "Sell Your Used Device | Get Best Price at Tekzo";
const FALLBACK_DESCRIPTION = "Sell your used smartphones and tablets to Tekzo. Get instant price quotes and quick payment. Safe, secure and hassle-free.";
const FALLBACK_IMAGE = "/loginPage/contact-about-bg.webp";

export async function generateMetadata(): Promise<Metadata> {
  const seoData = rec(await getSeoPage("sell-your-device"));

  const title = str(seoData?.title) || FALLBACK_TITLE;
  const description = str(seoData?.description) || FALLBACK_DESCRIPTION;
  const image = str(seoData?.ogImage) || FALLBACK_IMAGE;
  const canonical = seoData?.canonicalUrl ? `${String(seoData.canonicalUrl)}/sell-your-device` : "/sell-your-device";

  return {
    title,
    description,
    keywords: seoData?.tags ? tagsOr(seoData.tags, []) : "sell used device, sell phone, sell smartphone, used device buyback, tekzo sell",
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: str(seoData?.siteName),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    alternates: {
      canonical,
    },
  };
}

async function checkAuth() {
  const cookieStore = await cookies();
  const hasAuth = cookieStore.has("has_auth");
  return hasAuth;
}

export default async function SellYourDevice() {
  const [isLoggedIn, seoRaw] = await Promise.all([checkAuth(), getSeoPage("sell-your-device")]);
  const seoData = rec(seoRaw);

  return (
    <div className="min-h-screen">
      <Banner image={seoData?.banner || FALLBACK_IMAGE} title={seoData?.title || "Sell Your Device"} />
      <SellYourDeviceContent isLoggedIn={isLoggedIn} />
      <div className="">
        <PageDescription title="Learn More About Selling Your Device" description={seoData?.description || FALLBACK_DESCRIPTION} />
      </div>
    </div>
  );
}
