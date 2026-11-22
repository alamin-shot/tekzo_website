import React from "react";
import ProductListJsonLd from "@/Components/SEO/ProductListJsonLd";
import "./page.module.css";
import Banner from "@/Components/ReuseableComponent/Banner";
import Breadcrumbs from "@/Components/ReuseableComponent/Breadcrumbs";
import Filter from "@/Components/Shop/Filter";
import ShopProducts from "@/Components/Shop/ShopProducts";
import { getShopProducts, getBrands } from "@/lib/api";
import Pagination from "@/Components/Shop/Pagination";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import PageDescription from "@/Components/ReuseableComponent/PageDescription";
import ShopHeaderWithFilter from "@/Components/Shop/ShopHeaderWithFilter";

function buildShopQuery(params) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.min_price) query.set("min_price", params.min_price);
  if (params.max_price) query.set("max_price", params.max_price);
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.brand) query.set("brand", params.brand);
  if (params.category) query.set("category", params.category);
  if (params.stock) query.set("stock", params.stock);
  return query.toString();
}

export async function generateMetadata() {
  const data = await getShopProducts(buildShopQuery({ page: 1 }));
  const seo = data?.seoData;

  const title = seo?.title;
  const description = seo?.description ?? "";
  const keywords = seo?.tags ? seo.tags.split(",").map((t) => t.trim()) : [];
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "https://www.tekzo.com.bd").replace(/\/$/, "");
  const canonical = seo?.canonical || `${baseUrl}/shop`;
  const ogImage = seo?.ogImage || "/all-product-banner.webp";
  const siteName = seo?.siteName;

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

const Shop = async ({ searchParams }) => {
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

  return (
    <div>
      <ProductListJsonLd products={shopProducts?.products?.data} path="/shop" name={shopProducts?.seoData?.title || "Shop"} description={shopProducts?.seoData?.description} />
      <div className="overflow-visible">
        <Banner
          image={shopProducts?.seoData?.banner || "/all-product-banner.webp"}
          title={shopProducts?.seoData?.title || "Shop"}
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
        {shopProducts?.products?.data?.length > 0 ? (
          <ShopProducts shopProducts={shopProducts.products} />
        ) : (
          <NoProductFound />
        )}

        {/* Pagination */}
        <Pagination
          shopProducts={shopProducts.products}
          currentPage={currentPage}
        />

        {/* Page Description */}
        <PageDescription
          title="Learn More About Tekzo Shop"
          description={shopProducts?.seoData?.page_description}
        />
      </main>
    </div>
  );
};

export default Shop;
