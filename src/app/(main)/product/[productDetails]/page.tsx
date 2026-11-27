// app/products/[productDetails]/page.jsx
import ProductJsonLd from "@/Components/SEO/ProductJsonLd";
import QuickAnswers from "@/Components/SEO/QuickAnswers";
import { buildProductAnswers, buildListingAnswers } from "@/lib/seo/quickAnswers";
import ProductViewTracker from "@/Components/Tracker/ProductViewTracker";
import ProductDetails from "@/Components/ReuseableComponent/ProductDetails/ProductDetails";
import {
  getProduct,
  getRelatedProducts,
  getProductReviews,
  getSettings,
  getBrands,
  getPolicies,
} from "@/lib/api";
import type { Metadata } from "next";
import type { ParamsOnlyProps } from "@/types/route";
import { isList, rec, requireString } from "@/lib/json";
import { str } from "@/lib/render";
import { absoluteOgImage, tagsOr } from "@/lib/seo/metadata";

// Next renders `other` meta values with `.toString()`; numbers pass through.
const metaValue = (value: unknown): string | number => (typeof value === "number" ? value : String(value));

// Without this, the route had no generateStaticParams and no revalidate
// window, so every visit re-ran the full SSR render even though the
// underlying getProduct() fetch was already cached (revalidate: false +
// tag-based). This lets Next cache the rendered HTML per slug for an hour;
// a price/stock change still busts it immediately via the existing
// on-demand tag revalidation (tags: ["products", `product-${slug}`]).
export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

// ─── Dynamic Metadata ─────────────────────────────────────
export async function generateMetadata({ params }: ParamsOnlyProps): Promise<Metadata> {
  try {
    const { productDetails } = await params;
    const data = rec(await getProduct(productDetails));
    const seo = rec(data?.seoData);
    const baseUrl = (
      process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd"
    ).replace(/\/$/, "");

    // Build fallback title and description
    const title =
      str(seo?.title) || str(data?.product_name) || `Product - ${productDetails}`;
    // `.substring` on a truthy non-string threw; kept
    const description =
      str(seo?.description) ||
      (data?.short_description
        ? requireString(data.short_description).substring(0, 160)
        : "") ||
      `Shop ${String(data?.product_name || productDetails)} at Tekzo. Authorized dealer with genuine products, warranty, and best prices in Bangladesh.`;

    const keywords = tagsOr(seo?.tags, [data?.product_name, data?.brand_name, "tekzo"].filter(Boolean).map(String));

    // preOwnedId/utm_source/etc. query variants are the same product page —
    // always canonicalize to the clean URL so they aren't flagged as duplicates.
    const canonical = str(seo?.canonical) || `${baseUrl}/product/${productDetails}`;

    // Get image - ensure it's an absolute URL
    // Convert relative URLs to absolute URLs
    const ogImage = absoluteOgImage(
      seo?.ogImage ||
      data?.image ||
      data?.thumbnail ||
      "/all-product-banner.webp", baseUrl) ?? "";

    const siteName = str(seo?.siteName) || "Tekzo";

    return {
      title,
      description,
      keywords,
      metadataBase: new URL(baseUrl),
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName,
        type: "website",
        locale: "en_US",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/webp",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
        site: "@tekzobd",
      },
      other: {
        "content-signal": "search=yes,ai-train=no",
        "og:type": "product",
        "og:image:width": "1200",
        "og:image:height": "630",
        "product:price:amount": metaValue(data?.price || ""),
        "product:price:currency": "BDT",
        "product:availability": data?.stock ? "in stock" : "out of stock",
        "product:brand": metaValue(data?.brand_name || ""),
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
  } catch (error) {
    console.error("Error generating metadata for product:", error);

    // Fallback metadata in case of error
    const baseUrl = (
      process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd"
    ).replace(/\/$/, "");

    return {
      title: "Product - Tekzo",
      description:
        "Shop premium tech products at Tekzo. Authorized dealer with genuine products, warranty, and best prices in Bangladesh.",
      metadataBase: new URL(baseUrl),
    };
  }
}

// ─── Page Component ───────────────────────────────────────
const ProductDetailsPage = async ({ params }: ParamsOnlyProps) => {
  const { productDetails } = await params;

  const [data, relatedProductsData, reviewsData, companySetting, policies] =
    await Promise.all([
      getProduct(productDetails),
      getRelatedProducts(productDetails),
      getProductReviews(productDetails),
      // already fetched (and cached) by the root layout — this just reuses it,
      // no extra network call, so ShareDetails doesn't need its own client fetch
      getSettings(),
      getPolicies(),
    ]);

  const seo = rec(data)?.seoData;
  const allBrands = await getBrands();
  const brandTagline = rec((isList(allBrands) ? allBrands : []).find((b) => rec(b)?.slug === rec(rec(data)?.brand)?.slug))?.tagline;

  return (
    <div>
      <ProductJsonLd seo={seo} product={data} />

      <ProductViewTracker product={data} />

      <ProductDetails
        productDetails={data}
        relatedProductsData={relatedProductsData}
        reviewsData={reviewsData}
        supportPhone={rec(companySetting)?.primary_phone_number}
        companySetting={companySetting}
        policies={policies}
        afterDetails={(() => {
          const qa = buildProductAnswers(data, reviewsData, brandTagline);
          return qa ? <QuickAnswers {...qa} /> : null;
        })()}
      />
    </div>
  );
};

export default ProductDetailsPage;
