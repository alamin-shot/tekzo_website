"use client";

import Image from "next/image";
import Link from "next/link";
import Card from "@/Components/ReuseableComponent/Card";
import NoProductFound from "@/Components/ReuseableComponent/NoProductFound";
import CardMain from "@/Components/ReuseableComponent/CardMain";
import Pagination from "@/Components/Shop/Pagination";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

const CategoryProducts = ({ product, fromCategory, onFiltersChange, pagination, currentPage, isSearching = false }) => {
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

  const isValidImage = (url) => {
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

  // Apply filters and sorting to products
  const filteredProducts = useMemo(() => {
    let filtered = product?.products ? [...product.products] : [];

    // Filter by price range
    if (minPrice || maxPrice) {
      filtered = filtered.filter((p) => {
        const price = p.final_price || p.regular_price || 0;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Filter by stock
    if (stock) {
      filtered = filtered.filter((p) => {
        if (stock === "in_stock") return p.is_stock === true || p.is_stock === 1;
        if (stock === "out_of_stock") return p.is_stock === false || p.is_stock === 0;
        return true;
      });
    }

    // Sort products
    if (sortBy) {
      filtered.sort((a, b) => {
        const priceA = a.final_price || a.regular_price || 0;
        const priceB = b.final_price || b.regular_price || 0;

        if (sortBy === "price_asc") return priceA - priceB;
        if (sortBy === "price_desc") return priceB - priceA;
        return 0;
      });
    }

    return filtered;
  }, [product.products, minPrice, maxPrice, sortBy, stock]);
  const showSkeleton = isLoading || isSearching;

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
                key={product.id}
                titleAs="h2"
                product={product}
                name={product?.product_name}
                discountPrice={product?.discount_price}
                currentPrice={product?.final_price}
                originalPrice={product?.regular_price}
                discount={product?.discount_amount}
                discountPercentage={product?.discount_label}
                discountAmount={product?.discount_amount}
                rating={product?.rating}
                image={product?.product_image}
                link={product?.slug}
                isStock={product?.is_stock}
                from={"categories"}
                brandLink={product?.category?.slug?.toLowerCase()}
                brandName={product?.category?.name}
                // categoryLink={product?.category?.slug?.toLowerCase()}
                categoryLink={product?.brand?.slug?.toLowerCase()}
                categoryName={product?.brand?.name}
                fromCategory={fromCategory}
              />
            ))}
          </div>
          <div className="my-mt">
            {isValidImage(product?.info_banner) && (
              <div className="w-full h-30 lg:h-50 xl:h-60 my-4 lg:my-6 xl:my-8 overflow-hidden">
                <Image
                  src={product.info_banner}
                  alt={`${product?.name} banner`}
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
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 my-gap">
            {filteredProducts.slice(4).map((product) => (
              <CardMain
                key={product.id}
                titleAs="h2"
                product={product}
                name={product?.product_name}
                discountPrice={product?.discount_price}
                currentPrice={product?.final_price}
                originalPrice={product?.regular_price}
                discount={product?.discount_amount}
                discountPercentage={product?.discount_label}
                discountAmount={product?.discount_amount}
                rating={product?.rating}
                image={product?.product_image}
                link={product?.slug}
                isStock={product?.is_stock}
                from={"categories"}
                brandLink={product?.category?.slug?.toLowerCase()}
                brandName={product?.category?.name}
                // categoryLink={product?.category?.slug?.toLowerCase()}
                categoryLink={product?.brand?.slug?.toLowerCase()}
                categoryName={product?.brand?.name}
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
