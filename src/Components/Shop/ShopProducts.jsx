"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import CardMain from "../ReuseableComponent/CardMain";

const ShopProducts = ({ shopProducts }) => {
  const searchParams = useSearchParams();
  const sortBy = searchParams.get("sort_by");

  const sortedProducts = useMemo(() => {
    if (!shopProducts?.data) return [];

    const products = [...shopProducts.data];

    if (sortBy === "price_asc") {
      return products.sort((a, b) => {
        const priceA = parseFloat(a?.final_price) || 0;
        const priceB = parseFloat(b?.final_price) || 0;
        return priceA - priceB;
      });
    } else if (sortBy === "price_desc") {
      return products.sort((a, b) => {
        const priceA = parseFloat(a?.final_price) || 0;
        const priceB = parseFloat(b?.final_price) || 0;
        return priceB - priceA;
      });
    }

    // Return original order if no sort or default sort
    return products;
  }, [shopProducts?.data, sortBy]);

  return (
    <div className="">
      <div className="grid grid-cols-2 lg:grid-cols-4 my-gap my-my">
        {sortedProducts?.map((product) => (
          <CardMain
            key={product.id}
            product={product}
            name={product?.product_name}
            category={product?.category?.name}
            categoryLink={product?.category?.slug?.toLowerCase()}
            badge={product?.product_badge}
            currentPrice={product?.final_price}
            originalPrice={product?.regular_price}
            discount={product?.discount_amount}
            discountPercentage={product?.discount_label}
            discountAmount={product?.discount_amount}
            rating={product?.rating}
            image={product?.product_image}
            link={product?.slug}
            isStock={product?.is_stock}
          ></CardMain>
        ))}
      </div>
    </div>
  );
};

export default ShopProducts;
