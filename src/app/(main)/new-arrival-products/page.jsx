import Banner from "@/Components/ReuseableComponent/Banner";
import Section from "@/Components/ReuseableComponent/Section";
import { getNewArrivalProducts } from "@/lib/api";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import { MdVerified } from "react-icons/md";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import Image from "next/image";
import PageDescription from "@/Components/Description/PageDescription";
import Pagination from "@/Components/Shop/Pagination";
import Filter from "@/Components/Shop/Filter";
import { filterAndSortProducts } from "@/utils/filterProducts";

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const pageSuffix = page > 1 ? ` - Page ${page}` : "";
  const canonical = page > 1 ? `/new-arrival-products?page=${page}` : "/new-arrival-products";

  return {
    title: `New Arrivals${pageSuffix} — Latest Tech Products`,
    description: "Explore the latest new arrivals at Tekzo. Fresh smartphones, earbuds, smartwatches, and gadgets with official warranty.",
    alternates: {
      canonical,
    },
    openGraph: {
      title: `New Arrivals${pageSuffix} — Latest Tech Products`,
      description: "Explore the latest new arrivals at Tekzo. Fresh smartphones, earbuds, smartwatches, and gadgets with official warranty.",
      url: canonical,
      siteName: "Tekzo",
      type: "website",
      images: [
        {
          url: "/sidebar-icons/offers.png",
          width: 1200,
          height: 630,
          alt: "Tekzo New Arrivals",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/sidebar-icons/offers.png"],
    },
  };
}

export default async function NewArrivalProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  const currentFilters = {
    min_price: resolvedSearchParams?.min_price || "",
    max_price: resolvedSearchParams?.max_price || "",
    sort_by: resolvedSearchParams?.sort_by || "",
    brand: resolvedSearchParams?.brand || "",
    category: resolvedSearchParams?.category || "",
    stock: resolvedSearchParams?.stock || "",
  };

  const { products, pagination, description, seoData } = await getNewArrivalProducts(
    currentPage,
    currentFilters,
  );

  const displayProducts = filterAndSortProducts(products, currentFilters);

  const pageDescription =
    description ||
    seoData?.page_description ||
    "Explore the latest new arrivals at Tekzo. Discover freshly released smartphones, premium audio gear, smartwatches, chargers, and the most exciting tech accessories in Bangladesh. Every product is 100% authentic, backed by official warranty, and delivered quickly to your doorstep.";

  return (
    <div className="min-h-screen">
      <Banner image="/all-product-banner.webp" title="New Arrival" />

      <main>
        <Breadcrumbs />

        <Section>
          <div>
            {/* Header with Logo, Title & Verification Tick Mark (Countdown avoided as requested) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              {/* Left: Logo + Title */}
              <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                {/* Logo Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 p-2 shrink-0 rounded-full border-3 border-gray-200 flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 shadow-sm">
                  <Image
                    src="/sidebar-icons/offers.png"
                    alt="New Arrival"
                    width={60}
                    height={60}
                    className="object-contain w-full"
                  />
                </div>

                {/* Title & Verification Tick Mark */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      TEKZO New Arrival
                    </h1>
                    <MdVerified className="text-blue-500 text-lg lg:text-xl shrink-0" />
                  </div>
                  <p className="text-xs lg:text-sm text-gray-500">
                    Explore our latest arrivals &mdash; authentic tech products just arrived!
                  </p>
                </div>
              </div>

              {/* Right: Item Count */}
              <div className="text-xs lg:text-sm text-gray-500 shrink-0 font-medium">
                Showing <span className="font-bold text-gray-900">{displayProducts.length}</span> of <span className="font-bold text-gray-900">{pagination?.total || products.length}</span> items
              </div>
            </div>

            {/* Filter Section */}
            <Filter currentFilters={currentFilters} />

            {/* Product Grid */}
            {displayProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 my-gap my-my">
                  {displayProducts.map((product) => (
                    <CardMain
                      key={product.id}
                      product={product}
                      name={product?.product_name}
                      category={product?.category?.name}
                      categoryLink={product?.category?.slug?.toLowerCase()}
                      badge={product?.badge || product?.product_badge}
                      currentPrice={product?.final_price}
                      originalPrice={product?.regular_price}
                      discountPercentage={product?.discount_label}
                      discountAmount={product?.discount_amount}
                      rating={product?.rating ?? product?.avg_rating}
                      image={product?.product_image}
                      link={product?.slug}
                      isStock={product?.is_stock}
                      productData={product}
                      from={"new-arrival"}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination shopProducts={{ pagination }} currentPage={currentPage} />
              </>
            ) : (
              <>
                <title>No Products Found - Tekzo</title>
                <NoProductFound />
              </>
            )}
          </div>
        </Section>
        <PageDescription
          title="Learn More About TEKZO New Arrivals"
          description={pageDescription}
        />
      </main>
    </div>
  );
}
