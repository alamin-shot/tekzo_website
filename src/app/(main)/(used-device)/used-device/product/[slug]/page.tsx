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
import type { Metadata } from "next";
import type { SlugPageProps } from "@/types/route";
import { fieldsOf, isList, rec } from "@/lib/json";
import { str } from "@/lib/render";
import { tagsOr } from "@/lib/seo/metadata";

// swiper only ships to routes that actually render a slider
const ProductDetails = dynamic(
  () => import("@/Components/UsedDevice/UsedDeviceProductDetails/ProductDetails/ProductDetails"),
);

// ─── Dynamic Metadata ─────────────────────────────────────
// Added searchParams here so SEO matches the specific preOwnedId
export async function generateMetadata({ params, searchParams }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preOwnedId } = fieldsOf(await searchParams);

  const data = rec(await getUsedDeviceProduct(slug, preOwnedId));
  const seo = rec(data?.seoData);

  const title = str(seo?.title) || str(data?.product_name);
  const description = str(seo?.description) || "";
  const keywords = tagsOr(seo?.tags, []);
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  // Each preOwnedId is a distinct listing (own condition/price/SEO), so keep
  // it in the fallback canonical rather than collapsing to the bare slug.
  // Always this page's own URL — the API's seo.canonical used to point at
  // /product/{slug}, a different page.
  const canonical = `${baseUrl}/used-device/product/${slug}${preOwnedId ? `?preOwnedId=${String(preOwnedId)}` : ""}`;
  const ogImage = str(seo?.ogImage) || "/all-product-banner.webp";
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
const ProductDetailsPage = async ({ params, searchParams }: SlugPageProps) => {
  const { slug } = await params;
  const { preOwnedId } = fieldsOf(await searchParams); // Capture the ID from query string

  const data = await getUsedDeviceProduct(slug, preOwnedId);
  const companySetting = rec(await getSettings());
  const relatedProducts = await getPreOwnedRelatedProducts(slug, preOwnedId);

  const seo = rec(data)?.seoData;
  const allBrands = await getBrands();
  const brandMatch = (isList(allBrands) ? allBrands : []).find((b) => rec(b)?.slug === rec(rec(data)?.brand)?.slug);
  const brandTagline = rec(brandMatch)?.tagline;
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
