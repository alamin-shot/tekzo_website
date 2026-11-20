import { getAllBrands, getBrandProducts } from "@/lib/api";
import Banner from "@/Components/ReuseableComponent/Banner";
import SingleCategory from "@/Components/Home/Categories/CategoryDetails/SingleCategory";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";

export const revalidate = 3600;

export async function generateStaticParams() {
  const result = await getAllBrands();
  const brands = result?.data?.brands || [];
  return brands.map((brand) => ({ slug: brand.slug?.toLowerCase() }));
}

// ─── Dynamic Metadata ─────────────────────────────────────
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const data = await getBrandProducts(slug);
    const seo = data?.seoData;
    const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");

    // Build fallback title and description
    const brandName = data?.name || slug.replace(/-/g, " ");
    const title = seo?.title || `${brandName} Products - Shop Authentic & Original | Tekzo`;
    const description =
      seo?.description || data?.description || `Shop genuine ${brandName} products at Tekzo. Authorized dealer offering authentic products, official warranty, and competitive prices in Bangladesh.`;

    const keywords = seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [brandName, "tekzo", "bangladesh", "authorized dealer"];

    const canonical = seo?.canonical || `${baseUrl}/brands/${slug}`;

    // Get image - ensure it's an absolute URL
    let ogImage = seo?.ogImage || data?.banner || data?.logo || "/all-product-banner.webp";

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
export default async function BrandPage({ params, searchParams }) {
  // Await params and searchParams in Next.js 15
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const { category, brand, page, sort_by, stock, min_price, max_price, search } = resolvedSearchParams;

  // Fetch data immediately for initial render - no Suspense delay
  const currentPage = Number(page) || 1;
  const product = await getBrandProducts(slug, category, currentPage, sort_by, stock, min_price, max_price, search);

  return (
    <div>
      <Banner image={product?.banner || "/all-product-banner.webp"} title={product?.name || "product not found"} />
      {product ? (
        <>
          <SingleCategory product={product} activeCategory={category} activeBrand={brand} pagination={product?.pagination} currentPage={currentPage} />
          <PageDescription title={product?.name ? `Learn More About ${product.name}` : "Learn More About This Brand"} description={product?.description} />
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
