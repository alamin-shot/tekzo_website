import type { Metadata } from "next";
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
import type { SlugPageProps } from "@/types/route";
import { fieldsOf, rec, requireString } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

// `description?.replace(/<[^>]*>/g, "").slice(0, 160)` — a non-string threw; kept.
const plainDescription = (value: unknown): string | undefined =>
  value === null || value === undefined ? undefined : requireString(value).replace(/<[^>]*>/g, "").slice(0, 160);

export async function generateMetadata({ params, searchParams }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  // Same args as the page body's call below so React's cache() dedupes this
  // into a single request instead of firing two origin API calls.
  const data = await getOfferWithProducts(slug, currentPage, resolvedSearchParams);
  const offer = rec(rec(data)?.offer);
  return {
    title: str(offer?.title) ?? "Offer",
    description: plainDescription(offer?.description),
    openGraph: {
      title: str(offer?.title) ?? "Offer",
      description: plainDescription(offer?.description),
      images: [
        {
          // A missing banner leaves url empty; Next skips images without one, as before.
          url: str(offer?.banner) ?? "",
          width: 800,
          height: 600,
          alt: str(offer?.title),
        },
      ],
      type: "website",
      siteName: "Tekzo",
    },
    twitter: {
      card: "summary_large_image",
      title: str(offer?.title) ?? "Offer",
      description: plainDescription(offer?.description),
      images: [
        {
          url: str(offer?.banner) ?? "",
          width: 800,
          height: 600,
          alt: str(offer?.title),
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

export default async function OfferSlugPage({ params, searchParams }: SlugPageProps) {
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

  if (!rec(data)?.offer) notFound();

  const { offer, products = [], pagination } = fieldsOf(data);
  const displayProducts = filterAndSortProducts(products, currentFilters);
  // `offer` is truthy here; a primitive offer has no fields (as `offer.title` gave undefined).
  const info = rec(offer);

  return (
    <div>
      <ProductListJsonLd products={displayProducts} path={`/shop/offer/${slug}`} name={info?.title} />
      <Banner image={info?.banner} title={info?.title} h1={undefined} hideImageOnMobile={undefined} />
      <div className="">
        <Breadcrumbs />

        <div className="w-full  py-4">
          {/* Title + Countdown row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight max-w-2xl">
              {nodeOf(info?.title)}
            </h1>
            <CountdownTimer endAt={info?.end_at} />
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
              {displayProducts.map((product) => {
                // `product.product_name` etc. threw for a null product; fieldsOf keeps that.
                const p = fieldsOf(product);
                return (
                <CardMain
                  key={idKey(product)}
                  product={product}
                  name={p.product_name}
                  currentPrice={p.final_price}
                  originalPrice={p.regular_price}
                  discountPercentage={p.discount_label}
                  discountAmount={p.discount_amount}
                  image={p.product_image}
                  link={p.slug}
                  isStock={"true"}
                  from={"offer"}
                  offerName={rec(rec(product)?.brand)?.name}
                  offerLink={rec(rec(product)?.brand)?.slug}
                />
                );
              })}
            </div>
          ) : (
            <NoProductFound />
          )}

          <Pagination shopProducts={{ pagination }} currentPage={currentPage} />
          <PageDescription
            title={
              info?.title
                ? `Learn More About ${String(info.title)}`
                : "Learn More About This Offer"
            }
            description={info?.description}
          />
        </div>
      </div>
    </div>
  );
}
