import Banner from "@/Components/ReuseableComponent/Banner";
import SellYourDeviceContent from "@/Components/SellYourDevice/SellYourDeviceContent";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import { cookies } from "next/headers";
import { getSeoPage } from "@/lib/api";

export const revalidate = 3600;

const FALLBACK_TITLE = "Sell Your Used Device | Get Best Price at Tekzo";
const FALLBACK_DESCRIPTION = "Sell your used smartphones and tablets to Tekzo. Get instant price quotes and quick payment. Safe, secure and hassle-free.";
const FALLBACK_IMAGE = "/loginPage/contact-about-bg.webp";

export async function generateMetadata() {
  const seoData = await getSeoPage("sell-your-device");

  const title = seoData?.title || FALLBACK_TITLE;
  const description = seoData?.description || FALLBACK_DESCRIPTION;
  const image = seoData?.ogImage || FALLBACK_IMAGE;
  const canonical = seoData?.canonicalUrl ? `${seoData.canonicalUrl}/sell-your-device` : "/sell-your-device";

  return {
    title,
    description,
    keywords: seoData?.tags ? seoData.tags.split(",").map((t) => t.trim()) : "sell used device, sell phone, sell smartphone, used device buyback, tekzo sell",
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: seoData?.siteName,
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
  const [isLoggedIn, seoData] = await Promise.all([checkAuth(), getSeoPage("sell-your-device")]);

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
