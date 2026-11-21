// app/products/[productDetails]/page.jsx
import ProductJsonLd from "@/Components/SEO/ProductJsonLd";
import ProductViewTracker from "@/Components/Tracker/ProductViewTracker";
import ProductDetails from "@/Components/ReuseableComponent/ProductDetails/ProductDetails";
import {
  getProduct,
  getRelatedProducts,
  getProductReviews,
  getSettings,
  getPolicies,
} from "@/lib/api";

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
export async function generateMetadata({ params }) {
  try {
    const { productDetails } = await params;
    const data = await getProduct(productDetails);
    const seo = data?.seoData;
    const baseUrl = (
      process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd"
    ).replace(/\/$/, "");

    // Build fallback title and description
    const title =
      seo?.title || data?.product_name || `Product - ${productDetails}`;
    const description =
      seo?.description ||
      (data?.short_description
        ? data.short_description.substring(0, 160)
        : "") ||
      `Shop ${data?.product_name || productDetails} at Tekzo. Authorized dealer with genuine products, warranty, and best prices in Bangladesh.`;

    const keywords = seo?.tags
      ? seo.tags.split(",").map((t) => t.trim())
      : [data?.product_name, data?.brand_name, "tekzo"].filter(Boolean);

    // preOwnedId/utm_source/etc. query variants are the same product page —
    // always canonicalize to the clean URL so they aren't flagged as duplicates.
    const canonical = seo?.canonical || `${baseUrl}/product/${productDetails}`;

    // Get image - ensure it's an absolute URL
    let ogImage =
      seo?.ogImage ||
      data?.image ||
      data?.thumbnail ||
      "/all-product-banner.webp";

    // Convert relative URLs to absolute URLs
    if (ogImage && ogImage.startsWith("/")) {
      ogImage = `${baseUrl}${ogImage}`;
    } else if (ogImage && !ogImage.startsWith("http")) {
      ogImage = `${baseUrl}/${ogImage}`;
    }

    const siteName = seo?.siteName || "Tekzo";

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
        "product:price:amount": data?.price || "",
        "product:price:currency": "BDT",
        "product:availability": data?.stock ? "in stock" : "out of stock",
        "product:brand": data?.brand_name || "",
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
const ProductDetailsPage = async ({ params }) => {
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

  const seo = data?.seoData;

  return (
    <div>
      <ProductJsonLd seo={seo} product={data} />

      <ProductViewTracker product={data} />

      <ProductDetails
        productDetails={data}
        relatedProductsData={relatedProductsData}
        reviewsData={reviewsData}
        supportPhone={companySetting?.primary_phone_number}
        companySetting={companySetting}
        policies={policies}
      />
    </div>
  );
};

export default ProductDetailsPage;
