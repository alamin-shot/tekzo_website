"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import CardMain from "../ReuseableComponent/CardMain";
import type { ShopProductsProps } from "@/types/props/shop";
import { lowerOpt, rec, spreadList } from "@/lib/json";
import { idKey } from "@/lib/render";

// `parseFloat(a?.final_price) || 0` (parseFloat stringifies its argument)
const priceOf = (product: unknown): number => parseFloat(String(rec(product)?.final_price)) || 0;

const ShopProducts = ({ shopProducts }: ShopProductsProps) => {
  const searchParams = useSearchParams();
  const sortBy = searchParams.get("sort_by");
  const data = rec(shopProducts)?.data;

  const sortedProducts = useMemo(() => {
    if (!data) return [];

    const products = spreadList(data);

    if (sortBy === "price_asc") {
      return products.sort((a, b) => {
        const priceA = priceOf(a);
        const priceB = priceOf(b);
        return priceA - priceB;
      });
    } else if (sortBy === "price_desc") {
      return products.sort((a, b) => {
        const priceA = priceOf(a);
        const priceB = priceOf(b);
        return priceB - priceA;
      });
    }

    // Return original order if no sort or default sort
    return products;
  }, [data, sortBy]);

  return (
    <div className="">
      <div className="grid grid-cols-2 lg:grid-cols-4 my-gap my-my">
        {sortedProducts?.map((product) => (
          <CardMain
            key={idKey(product)}
            product={product}
            name={rec(product)?.product_name}
            category={rec(rec(product)?.category)?.name}
            categoryLink={lowerOpt(rec(rec(product)?.category)?.slug)}
            badge={rec(product)?.product_badge}
            currentPrice={rec(product)?.final_price}
            originalPrice={rec(product)?.regular_price}
            discount={rec(product)?.discount_amount}
            discountPercentage={rec(product)?.discount_label}
            discountAmount={rec(product)?.discount_amount}
            rating={rec(product)?.rating}
            image={rec(product)?.product_image}
            link={rec(product)?.slug}
            isStock={rec(product)?.is_stock}
          ></CardMain>
        ))}
      </div>
    </div>
  );
};

export default ShopProducts;
