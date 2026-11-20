import { getCategoryInfo, getCategoryProductsBySlug } from "@/lib/api";
import Banner from "@/Components/ReuseableComponent/Banner";
import SingleCategory from "@/Components/Home/Categories/CategoryDetails/SingleCategory";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";

export const revalidate = 3600;

// ─── Dynamic Metadata ─────────────────────────────────────
export async function generateMetadata({ params, searchParams }) {
  try {
    const { slug } = await params;
    const { brand, page, sort_by, stock, min_price, max_price, search } = await searchParams;
    const currentPage = Number(page) || 1;

    // Fetch both category info and products for complete metadata
    const [categoryInfo, data] = await Promise.all([getCategoryInfo(slug), getCategoryProductsBySlug(slug, brand, currentPage, sort_by, stock, min_price, max_price, search)]);

    const seo = data?.seoData;
    const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

    // Build fallback title and description
    const categoryName = categoryInfo?.name || slug.replace(/-/g, " ");
    const title = seo?.title || `${categoryName} - Shop Premium Tech Products | Tekzo`;
    const description =
      seo?.description || data?.description || `Explore our wide range of ${categoryName} products at Tekzo. Authorized dealer with genuine products, warranty, and best prices in Bangladesh.`;

    const keywords = seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [categoryName, "tekzo", "bangladesh"];

    // Brand/page filters are variations of the same category, not distinct pages —
    // always canonicalize to the plain category URL so Google doesn't treat
    // ?brand=... / ?page=... as duplicate, uncanonicalized content.
    const canonical = seo?.canonical || `${baseUrl}/categories/${slug}`;

    // Get image - ensure it's an absolute URL
    let ogImage = seo?.ogImage;

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
      // Additional metadata for better social sharing
      other: {
        "og:image:width": "1200",
        "og:image:height": "630",
      },
    };
  } catch (error) {
    console.error("Error generating metadata for category:", error);

    // Fallback metadata in case of error
    const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

    return {
      title: "Shop Tech Products | Tekzo",
      description: "Explore our wide range of tech products at Tekzo. Authorized dealer with genuine products, warranty, and best prices in Bangladesh.",
      metadataBase: new URL(baseUrl),
    };
  }
}

// ─── Page Component ───────────────────────────────────────
export default async function CategoryPage({ params, searchParams }) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { brand, page, sort_by, stock, min_price, max_price, search } = resolvedSearchParams;

  // Fetch both pieces of data immediately - no Suspense delay
  const categoryInfo = await getCategoryInfo(slug);
  const currentPage = Number(page) || 1;
  const product = await getCategoryProductsBySlug(slug, brand, currentPage, sort_by, stock, min_price, max_price, search);

  return (
    <div>
      <Banner image={categoryInfo?.banner || "/all-product-banner.webp"} title={categoryInfo?.name || "no product found"} />
      {product ? (
        <>
          <SingleCategory fromCategory={"fromCategory"} product={product} activeBrand={brand} pagination={product?.pagination} currentPage={currentPage} />
          <PageDescription title={categoryInfo?.name ? `Learn More About ${categoryInfo.name}` : "Learn More About This Category"} description={product?.description || categoryInfo?.description} />
        </>
      ) : (
        <>
          <title>No Products Found - Tekzo</title>
          <NoProductFound></NoProductFound>
        </>
      )}
    </div>
  );
}
