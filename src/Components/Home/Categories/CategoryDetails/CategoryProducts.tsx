"use client";

import Image from "next/image";
import Link from "next/link";
import Card from "@/Components/ReuseableComponent/Card";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import Pagination from "@/Components/Shop/Pagination";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import type { CategoryProductsProps } from "@/types/props/shop";
import { fieldsOf, lowerOpt, rec, spreadList } from "@/lib/json";
import { idKey, nodeOf, str } from "@/lib/render";

// `p.final_price || p.regular_price || 0` — throws for a null product, as before.
const priceOf = (p: unknown): unknown => {
  const { final_price, regular_price } = fieldsOf(p);
  return final_price || regular_price || 0;
};

const CategoryProducts = ({ product, fromCategory, onFiltersChange, pagination, currentPage, isSearching = false }: CategoryProductsProps) => {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get filter values from URL
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const sortBy = searchParams.get("sort_by") || "";
  const stock = searchParams.get("stock") || "";
  const search = searchParams.get("search") || "";

  // Show loading state when filter params change
  useEffect(() => {
    setIsLoading(true);
    // Slightly longer delay for smoother transition
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice, sortBy, stock, search]);

  // Returns the falsy `url` itself (rendered by `&&` below) or the match result.
  const isValidImage = (url: unknown): unknown => {
    return url && typeof url === "string" && url.match(/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)$/i);
  };

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl lg:rounded-3xl p-3 border border-gray-100 animate-pulse flex flex-col justify-between shadow-xs">
      <div className="aspect-square bg-gray-200 rounded-xl lg:rounded-2xl mb-3 w-full" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded-md w-3/4" />
        <div className="h-3.5 bg-gray-100 rounded-md w-1/2" />
        <div className="flex justify-between items-center mt-3 pt-1">
          <div className="h-5 bg-gray-200 rounded-md w-20" />
          <div className="h-8 w-8 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );

  // `product.products` in the dependency list threw for a null product; kept.
  const products = fieldsOf(product).products;

  // Apply filters and sorting to products
  const filteredProducts = useMemo(() => {
    let filtered = products ? spreadList(products) : [];

    // Filter by price range
    // (`price < parseFloat(x)` converts the price to a number, as Number() does)
    if (minPrice || maxPrice) {
      filtered = filtered.filter((p) => {
        const price = Number(priceOf(p));
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Filter by stock
    if (stock) {
      filtered = filtered.filter((p) => {
        const { is_stock } = fieldsOf(p);
        if (stock === "in_stock") return is_stock === true || is_stock === 1;
        if (stock === "out_of_stock") return is_stock === false || is_stock === 0;
        return true;
      });
    }

    // Sort products
    if (sortBy) {
      filtered.sort((a, b) => {
        const priceA = Number(priceOf(a));
        const priceB = Number(priceOf(b));

        if (sortBy === "price_asc") return priceA - priceB;
        if (sortBy === "price_desc") return priceB - priceA;
        return 0;
      });
    }

    return filtered;
  }, [products, minPrice, maxPrice, sortBy, stock]);
  const showSkeleton = isLoading || isSearching;
  const info = rec(product);

  return (
    <div className="relative">
      {showSkeleton ? (
        <div className="mt-6 lg:mt-8 xl:mt-10 overflow-x-clip">
          <div className="grid grid-cols-2 lg:grid-cols-4 my-gap">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="mt-6 lg:mt-8 xl:mt-10 overflow-x-clip ">
          <div className="grid grid-cols-2 lg:grid-cols-4 my-gap ">
            {filteredProducts.slice(0, 4).map((product) => (
              <CardMain
                key={idKey(product)}
                titleAs="h2"
                product={product}
                name={rec(product)?.product_name}
                discountPrice={rec(product)?.discount_price}
                currentPrice={rec(product)?.final_price}
                originalPrice={rec(product)?.regular_price}
                discount={rec(product)?.discount_amount}
                discountPercentage={rec(product)?.discount_label}
                discountAmount={rec(product)?.discount_amount}
                rating={rec(product)?.rating}
                image={rec(product)?.product_image}
                link={rec(product)?.slug}
                isStock={rec(product)?.is_stock}
                from={"categories"}
                brandLink={lowerOpt(rec(rec(product)?.category)?.slug)}
                brandName={rec(rec(product)?.category)?.name}
                // categoryLink={product?.category?.slug?.toLowerCase()}
                categoryLink={lowerOpt(rec(rec(product)?.brand)?.slug)}
                categoryName={rec(rec(product)?.brand)?.name}
                fromCategory={fromCategory}
              />
            ))}
          </div>
          <div className="my-mt">
            {nodeOf(isValidImage(info?.info_banner) && (
              <div className="w-full h-30 lg:h-50 xl:h-60 my-4 lg:my-6 xl:my-8 overflow-hidden">
                <Image
                  src={str(info?.info_banner) ?? ""}
                  alt={`${String(info?.name)} banner`}
                  // Reduce these to reasonable desktop-max sizes
                  width={1600}
                  height={900}
                  className="w-full h-full object-cover rounded-2xl lg:rounded-3xl"
                  priority
                  fetchPriority="high"
                  // Add sizes to help Next.js serve smaller versions to mobile
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1600px"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 my-gap">
            {filteredProducts.slice(4).map((product) => (
              <CardMain
                key={idKey(product)}
                titleAs="h2"
                product={product}
                name={rec(product)?.product_name}
                discountPrice={rec(product)?.discount_price}
                currentPrice={rec(product)?.final_price}
                originalPrice={rec(product)?.regular_price}
                discount={rec(product)?.discount_amount}
                discountPercentage={rec(product)?.discount_label}
                discountAmount={rec(product)?.discount_amount}
                rating={rec(product)?.rating}
                image={rec(product)?.product_image}
                link={rec(product)?.slug}
                isStock={rec(product)?.is_stock}
                from={"categories"}
                brandLink={lowerOpt(rec(rec(product)?.category)?.slug)}
                brandName={rec(rec(product)?.category)?.name}
                // categoryLink={product?.category?.slug?.toLowerCase()}
                categoryLink={lowerOpt(rec(rec(product)?.brand)?.slug)}
                categoryName={rec(rec(product)?.brand)?.name}
                fromCategory={fromCategory}
              />
            ))}
          </div>

          <Pagination shopProducts={{ pagination }} currentPage={currentPage} />
        </div>
      ) : (
        <>
          <title>No Products Found - Tekzo</title>

          <NoProductFound></NoProductFound>
        </>
      )}
    </div>
  );
};

export default CategoryProducts;
