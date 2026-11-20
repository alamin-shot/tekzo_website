import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import FeaturedProductsSearchFilter from "@/Components/FeaturedProducts/FeaturedProductsSearchFilter";
import FeaturedProductsList from "@/Components/FeaturedProducts/FeaturedProductsList";
import { getFeaturedProducts } from "@/lib/api";

export const revalidate = 3600;

// ─── Metadata Generation ───────────────────────────────────────
export async function generateMetadata() {
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonical = `${baseUrl}/featured-products`;
  const title = "Featured Products";
  const description = "Explore our featured products at Tekzo. Discover authentic smartphones, audio devices, smart wearables, and premium accessories in Bangladesh with official warranty.";
  const ogImage = "/sidebar-icons/offers.png";

  return {
    title,
    description,
    keywords: ["featured products", "tekzo featured products", "best tech products bangladesh", "smartphones", "gadgets", "accessories"],
    metadataBase: new URL(baseUrl),
    alternates: { canonical },
    openGraph: {
      title: `${title} | Tekzo`,
      description,
      url: canonical,
      siteName: "Tekzo",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/sidebar-icons/offers.png",
          width: 1200,
          height: 630,
          alt: "Featured Products - Tekzo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Tekzo`,
      description,
      images: "/sidebar-icons/offers.png",
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

// ─── Page Component (Server-Side) ───────────────────────────────
const FeaturedProductsPage = async ({ searchParams }) => {
  // Await searchParams in Next.js 15+
  const params = await searchParams;
  const searchQuery = params?.search || "";

  // Fetch featured products on the server
  const products = await getFeaturedProducts();

  return (
    <div>
      <Banner image="/all-product-banner.webp" title="Featured Products" />
      <main className="">
        <Breadcrumbs />

        {/* Search Filter Header - Client Component */}
        <FeaturedProductsSearchFilter />

        {/* Product Grid List - Server Component */}
        <FeaturedProductsList products={products} searchQuery={searchQuery} />
      </main>

      <PageDescription
        title="Learn More About Our Featured Products"
        description="Explore Tekzo's handpicked selection of top-featured devices and accessories. We bring you the latest high-performance smartphones, premium audio gear, smart wearables, fast chargers, and top tech accessories at unbeatable prices in Bangladesh. All products are 100% authentic and backed by official brand warranty and dedicated customer support."
      />
    </div>
  );
};

export default FeaturedProductsPage;
