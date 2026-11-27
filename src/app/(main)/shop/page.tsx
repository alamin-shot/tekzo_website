import React from "react";
import type { Metadata } from "next";
import ProductListJsonLd from "@/Components/SEO/ProductListJsonLd";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Filter from "@/Components/Shop/Filter";
import ShopProducts from "@/Components/Shop/ShopProducts";
import { getShopProducts, getBrands } from "@/lib/api";
import Pagination from "@/Components/Shop/Pagination";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import ShopHeaderWithFilter from "@/Components/Shop/ShopHeaderWithFilter";
import type { SearchPageProps, SearchParamsRecord } from "@/types/route";
import { fieldsOf, lengthOpt, rec } from "@/lib/json";
import { str } from "@/lib/render";
import { setIf } from "@/lib/api/shared";
import { tagsOr } from "@/lib/seo/metadata";

// `if (params.x) query.set("x", params.x)` — setIf does exactly this
function buildShopQuery(params: SearchParamsRecord) {
  const query = new URLSearchParams();
  setIf(query, "page", params.page);
  setIf(query, "min_price", params.min_price);
  setIf(query, "max_price", params.max_price);
  setIf(query, "sort_by", params.sort_by);
  setIf(query, "brand", params.brand);
  setIf(query, "category", params.category);
  setIf(query, "stock", params.stock);
  return query.toString();
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getShopProducts(buildShopQuery({ page: 1 }));
  const seo = rec(rec(data)?.seoData);

  const title = str(seo?.title);
  const description = str(seo?.description) ?? "";
  const keywords = tagsOr(seo?.tags, []);
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonical = str(seo?.canonical) || `${baseUrl}/shop`;
  const ogImage = str(seo?.ogImage) || "/all-product-banner.webp";
  const siteName = str(seo?.siteName);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    // Other ai train and search stop
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

const Shop = async ({ searchParams }: SearchPageProps) => {
  const params = await searchParams;

  const [shopProducts, brands] = await Promise.all([
    getShopProducts(
      buildShopQuery({
        page: params?.page || 1,
        min_price: params?.min_price || null,
        max_price: params?.max_price || null,
        sort_by: params?.sort_by || null,
        brand: params?.brand || null,
        category: params?.category || null,
        stock: params?.stock || null,
      }),
    ),
    getBrands(),
  ]);

  const currentPage = Number(params?.page) || 1;
  const currentBrand = params?.brand || "";
  const shop = rec(shopProducts);
  const seoData = rec(shop?.seoData);

  return (
    <div>
      <ProductListJsonLd products={rec(shop?.products)?.data} path="/shop" name={seoData?.title || "Shop"} description={seoData?.description} />
      <div className="overflow-visible">
        <Banner
          image={seoData?.banner || "/all-product-banner.webp"}
          title={seoData?.title || "Shop"}
          h1={undefined}
          hideImageOnMobile={undefined}
        />
      </div>
      <main>
        <Breadcrumbs />

        {/* Header with Logo, Title, Brand Chips & Search */}
        <ShopHeaderWithFilter brands={brands} currentBrand={currentBrand} />

        {/* Filter Section */}
        <Filter
          currentFilters={{
            min_price: params.min_price || "",
            max_price: params.max_price || "",
            sort_by: params.sort_by || "",
            brand: params.brand || "",
            category: params.category || "",
            stock: params.stock || "",
          }}
        />

        {/* Products Grid */}
        {/* (`x?.length > 0` applies ToNumber to the length, as Number() does) */}
        {Number(lengthOpt(rec(shop?.products)?.data)) > 0 ? (
          <ShopProducts shopProducts={fieldsOf(shopProducts).products} />
        ) : (
          <NoProductFound />
        )}

        {/* Pagination */}
        {/* (`shopProducts.products` threw for a null result; fieldsOf keeps that) */}
        <Pagination
          shopProducts={fieldsOf(shopProducts).products}
          currentPage={currentPage}
        />

        {/* Page Description */}
        <PageDescription
          title="Learn More About Tekzo Shop"
          description={seoData?.page_description}
        />
      </main>
    </div>
  );
};

export default Shop;
