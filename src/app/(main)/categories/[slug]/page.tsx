import type { Metadata } from "next";
import { getCategoryInfo, getCategoryProductsBySlug } from "@/lib/api";
import QuickAnswers from "@/Components/SEO/QuickAnswers";
import { buildProductAnswers, buildListingAnswers } from "@/lib/seo/quickAnswers";
import ProductListJsonLd from "@/Components/SEO/ProductListJsonLd";
import Banner from "@/Components/ReuseableComponent/Banner";
import SingleCategory from "@/Components/Home/Categories/CategoryDetails/SingleCategory";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import type { SlugPageProps } from "@/types/route";
import { fieldsOf, rec } from "@/lib/json";
import { str } from "@/lib/render";
import { absoluteOgImage, tagsOr } from "@/lib/seo/metadata";

export const revalidate = 3600;

// ─── Dynamic Metadata ─────────────────────────────────────
export async function generateMetadata({ params, searchParams }: SlugPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    // (destructuring threw for a null searchParams; fieldsOf keeps that)
    const { brand, page, sort_by, stock, min_price, max_price, search } = fieldsOf(await searchParams);
    const currentPage = Number(page) || 1;

    // Fetch both category info and products for complete metadata
    const [categoryInfo, data] = await Promise.all([getCategoryInfo(slug), getCategoryProductsBySlug(slug, brand, currentPage, sort_by, stock, min_price, max_price, search)]);

    const seo = rec(rec(data)?.seoData);
    const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

    // Build fallback title and description
    // (template strings and the keyword list stringify the name, as String() does)
    const categoryName = String(rec(categoryInfo)?.name || slug.replace(/-/g, " "));
    const title = str(seo?.title) || `${categoryName} - Shop Premium Tech Products | Tekzo`;
    const description =
      str(seo?.description) || str(rec(data)?.description) || `Explore our wide range of ${categoryName} products at Tekzo. Authorized dealer with genuine products, warranty, and best prices in Bangladesh.`;

    const keywords = tagsOr(seo?.tags, [categoryName, "tekzo", "bangladesh"]);

    // Brand/page filters are variations of the same category, not distinct pages —
    // always canonicalize to the plain category URL so Google doesn't treat
    // ?brand=... / ?page=... as duplicate, uncanonicalized content.
    const canonical = str(seo?.canonical) || `${baseUrl}/categories/${slug}`;

    // Get image - ensure it's an absolute URL
    // Convert relative URLs to absolute URLs
    const ogImage = absoluteOgImage(seo?.ogImage, baseUrl);

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
            url: ogImage ?? "",
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
        images: [ogImage ?? ""],
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
export default async function CategoryPage({ params, searchParams }: SlugPageProps) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { brand, page, sort_by, stock, min_price, max_price, search } = fieldsOf(resolvedSearchParams);

  // Fetch both pieces of data immediately - no Suspense delay
  const categoryInfo = rec(await getCategoryInfo(slug));
  const currentPage = Number(page) || 1;
  const product = await getCategoryProductsBySlug(slug, brand, currentPage, sort_by, stock, min_price, max_price, search);
  const listing = rec(product);

  return (
    <div>
      <ProductListJsonLd products={listing?.products} path={`/categories/${slug}`} name={categoryInfo?.name} />
      <Banner image={categoryInfo?.banner || "/all-product-banner.webp"} title={categoryInfo?.name || "no product found"} h1={undefined} hideImageOnMobile={undefined} />
      {product ? (
        <>
          <SingleCategory fromCategory={"fromCategory"} product={product} activeBrand={brand} pagination={listing?.pagination} currentPage={currentPage} />
          {(() => {
            const qa = buildListingAnswers({
              kind: "category",
              entity: { name: categoryInfo?.name, slug },
              products: listing?.products,
              total: rec(listing?.pagination)?.total,
              brand: undefined,
              tagline: undefined,
              path: `/categories/${slug}`,
            });
            return qa ? <QuickAnswers {...qa} /> : null;
          })()}
          <PageDescription title={categoryInfo?.name ? `Learn More About ${String(categoryInfo.name)}` : "Learn More About This Category"} description={listing?.description || categoryInfo?.description} />
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
