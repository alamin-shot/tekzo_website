// app/products/[productDetails]/page.jsx
import dynamic from "next/dynamic";
import QuickAnswers from "@/Components/SEO/QuickAnswers";
import { buildUsedDeviceAnswers } from "@/lib/seo/quickAnswers";
import ProductJsonLd from "@/Components/SEO/ProductJsonLd";
import ProductViewTracker from "@/Components/Tracker/ProductViewTracker";
import {
  getBrands,
  getUsedDeviceProduct,
  getSettings,
  getPreOwnedRelatedProducts,
} from "@/lib/api";

// swiper only ships to routes that actually render a slider
const ProductDetails = dynamic(
  () => import("@/Components/UsedDevice/UsedDeviceProductDetails/ProductDetails/ProductDetails"),
);

// ─── Dynamic Metadata ─────────────────────────────────────
// Added searchParams here so SEO matches the specific preOwnedId
export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const { preOwnedId } = await searchParams;

  const data = await getUsedDeviceProduct(slug, preOwnedId);
  const seo = data?.seoData;

  const title = seo?.title || data?.product_name;
  const description = seo?.description || "";
  const keywords = seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [];
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  // Each preOwnedId is a distinct listing (own condition/price/SEO), so keep
  // it in the fallback canonical rather than collapsing to the bare slug.
  const canonical =
    seo?.canonical ||
    `${baseUrl}/used-device/product/${slug}${preOwnedId ? `?preOwnedId=${preOwnedId}` : ""}`;
  const ogImage = seo?.ogImage || "/all-product-banner.webp";
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    other: {
      "content-signal": "search=yes,ai-train=no",
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

// ─── Page Component ───────────────────────────────────────
const ProductDetailsPage = async ({ params, searchParams }) => {
  const { slug } = await params;
  const { preOwnedId } = await searchParams; // Capture the ID from query string

  const data = await getUsedDeviceProduct(slug, preOwnedId);
  const companySetting = await getSettings();
  const relatedProducts = await getPreOwnedRelatedProducts(slug, preOwnedId);

  const seo = data?.seoData;
  const allBrands = await getBrands();
  const brandTagline = (Array.isArray(allBrands) ? allBrands : []).find((b) => b?.slug === data?.brand?.slug)?.tagline;
  const qa = buildUsedDeviceAnswers(data, brandTagline, `/used-device/product/${slug}`);

  return (
    <div>
      <ProductJsonLd seo={seo} />

      <ProductViewTracker product={data} />

      <ProductDetails
        productDetails={data}
        supportPhone={companySetting?.primary_phone_number}
        relatedProducts={relatedProducts}
        afterDetails={qa ? <QuickAnswers {...qa} /> : null}
      />
    </div>
  );
};

export default ProductDetailsPage;
