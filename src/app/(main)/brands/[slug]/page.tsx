import type { Metadata } from "next";
import { getAllBrands, getBrandProducts } from "@/lib/api";
import QuickAnswers from "@/Components/SEO/QuickAnswers";
import { buildProductAnswers, buildListingAnswers } from "@/lib/seo/quickAnswers";
import ProductListJsonLd from "@/Components/SEO/ProductListJsonLd";
import Banner from "@/Components/ReuseableComponent/Banner";
import SingleCategory from "@/Components/Home/Categories/CategoryDetails/SingleCategory";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import type { ParamsOnlyProps, SlugPageProps } from "@/types/route";
import { fieldsOf, lowerOpt, mapList, rec } from "@/lib/json";
import { str } from "@/lib/render";
import { absoluteOgImage, tagsOr } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateStaticParams() {
  const result = await getAllBrands();
  const brands = rec(rec(result)?.data)?.brands || [];
  // (`brands.map` / `brand.slug` threw for a non-array / null brand; kept)
  return mapList(brands, (brand) => ({ slug: lowerOpt(fieldsOf(brand).slug) }));
}

// ─── Dynamic Metadata ─────────────────────────────────────
export async function generateMetadata({ params }: ParamsOnlyProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const data = rec(await getBrandProducts(slug));
    const seo = rec(data?.seoData);
    const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

    // Build fallback title and description
    // (template strings and the keyword list stringify the name, as String() does)
    const brandName = String(data?.name || slug.replace(/-/g, " "));
    const title = str(seo?.title) || `${brandName} Products - Shop Authentic & Original | Tekzo`;
    const description =
      str(seo?.description) || str(data?.description) || `Shop genuine ${brandName} products at Tekzo. Authorized dealer offering authentic products, official warranty, and competitive prices in Bangladesh.`;

    const keywords = tagsOr(seo?.tags, [brandName, "tekzo", "bangladesh", "authorized dealer"]);

    const canonical = str(seo?.canonical) || `${baseUrl}/brands/${slug}`;

    // Get image - ensure it's an absolute URL
    // Convert relative URLs to absolute URLs
    const ogImage = absoluteOgImage(seo?.ogImage || data?.banner || data?.logo || "/all-product-banner.webp", baseUrl);

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
    console.error("Error generating metadata for brand:", error);

    // Fallback metadata in case of error
    const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

    return {
      title: "Brand Products - Tekzo",
      description: "Shop authentic brand products at Tekzo. Authorized dealer with genuine products, warranty, and best prices in Bangladesh.",
      metadataBase: new URL(baseUrl),
    };
  }
}

// ─── Page Component ───────────────────────────────────────
export default async function BrandPage({ params, searchParams }: SlugPageProps) {
  // Await params and searchParams in Next.js 15
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const { category, brand, page, sort_by, stock, min_price, max_price, search } = fieldsOf(resolvedSearchParams);

  // Fetch data immediately for initial render - no Suspense delay
  const currentPage = Number(page) || 1;
  const product = await getBrandProducts(slug, category, currentPage, sort_by, stock, min_price, max_price, search);
  const listing = rec(product);

  return (
    <div>
      <ProductListJsonLd products={listing?.products} path={`/brands/${slug}`} name={listing?.name} />
      <Banner image={listing?.banner || "/all-product-banner.webp"} title={listing?.name || "product not found"} h1={undefined} hideImageOnMobile={undefined} />
      {product ? (
        <>
          <SingleCategory product={product} activeCategory={category} activeBrand={brand} pagination={listing?.pagination} currentPage={currentPage} />
          {(() => {
            const qa = buildListingAnswers({
              kind: "brand",
              entity: { name: listing?.name, slug },
              products: listing?.products,
              total: rec(listing?.pagination)?.total,
              brand: { name: listing?.name, slug },
              tagline: listing?.tagline,
              path: `/brands/${slug}`,
            });
            return qa ? <QuickAnswers {...qa} /> : null;
          })()}
          <PageDescription title={listing?.name ? `Learn More About ${String(listing.name)}` : "Learn More About This Brand"} description={listing?.description} />
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
