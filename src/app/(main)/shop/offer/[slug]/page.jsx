import Banner from "@/Components/ReuseableComponent/Banner";
import ProductListJsonLd from "@/Components/SEO/ProductListJsonLd";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Pagination from "@/Components/Shop/Pagination";
import CountdownTimer from "./CountdownTimer";
import { notFound } from "next/navigation";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import { getOfferWithProducts } from "@/lib/api";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import Filter from "@/Components/Shop/Filter";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import { filterAndSortProducts } from "@/utils/filterProducts";

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  // Same args as the page body's call below so React's cache() dedupes this
  // into a single request instead of firing two origin API calls.
  const data = await getOfferWithProducts(slug, currentPage, resolvedSearchParams);
  const offer = data?.offer;
  return {
    title: offer?.title ?? "Offer",
    description: offer?.description?.replace(/<[^>]*>/g, "").slice(0, 160),
    openGraph: {
      title: offer?.title ?? "Offer",
      description: offer?.description?.replace(/<[^>]*>/g, "").slice(0, 160),
      images: [
        {
          url: offer?.banner,
          width: 800,
          height: 600,
          alt: offer?.title,
        },
      ],
      type: "website",
      siteName: "Tekzo",
    },
    twitter: {
      card: "summary_large_image",
      title: offer?.title ?? "Offer",
      description: offer?.description?.replace(/<[^>]*>/g, "").slice(0, 160),
      images: [
        {
          url: offer?.banner,
          width: 800,
          height: 600,
          alt: offer?.title,
        },
      ],
    },

    alternates: {
      canonical: `https://www.tekzo.com.bd/shop/offer/${slug}`,
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

export default async function OfferSlugPage({ params, searchParams }) {
  const { slug } = await params;
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

  const data = await getOfferWithProducts(slug, currentPage, currentFilters);

  if (!data?.offer) notFound();

  const { offer, products = [], pagination } = data;
  const displayProducts = filterAndSortProducts(products, currentFilters);

  return (
    <div>
      <ProductListJsonLd products={displayProducts} path={`/shop/offer/${slug}`} name={offer.title} />
      <Banner image={offer.banner} title={offer.title} />
      <div className="">
        <Breadcrumbs />

        <div className="w-full  py-4">
          {/* Title + Countdown row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight max-w-2xl">
              {offer.title}
            </h1>
            <CountdownTimer endAt={offer.end_at} />
          </div>

          <div className="border-t border-gray-400 mb-4" />

          {/* Filter Section */}
          <Filter currentFilters={currentFilters} />

          {/* Item count */}
          <p className="text-sm text-gray-700 mb-6">
            Showing:{" "}
            <span className="font-bold">
              ({displayProducts.length} Items)
            </span>
          </p>

          {/* Product grid */}
          {displayProducts.length > 0 ? (
            <div className="mt-4 lg:mt-6 xl:mt-8 overflow-x-clip grid grid-cols-2 lg:grid-cols-4 my-gap">
              {displayProducts.map((product) => (
                <CardMain
                  key={product.id}
                  product={product}
                  name={product.product_name}
                  currentPrice={product.final_price}
                  originalPrice={product.regular_price}
                  discountPercentage={product.discount_label}
                  discountAmount={product.discount_amount}
                  image={product.product_image}
                  link={product.slug}
                  isStock={"true"}
                  from={"offer"}
                  offerName={product?.brand?.name}
                  offerLink={product?.brand?.slug}
                />
              ))}
            </div>
          ) : (
            <NoProductFound />
          )}

          <Pagination shopProducts={{ pagination }} currentPage={currentPage} />
          <PageDescription
            title={
              offer?.title
                ? `Learn More About ${offer.title}`
                : "Learn More About This Offer"
            }
            description={offer?.description}
          />
        </div>
      </div>
    </div>
  );
}
