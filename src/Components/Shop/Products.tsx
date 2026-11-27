"use client";

import { useEffect, useState } from "react";
import Card from "../ReuseableComponent/Card";
import Loader from "../Loader/Loader";
import CardMain from "../ReuseableComponent/CardMain";
import type { ProductsProps } from "@/types/props/shop";
import { mapList, rec, sliceOf } from "@/lib/json";
import { idKey } from "@/lib/render";

const Products = ({ link }: ProductsProps) => {
  const [products, setProducts] = useState<unknown>([]);
  const [loading, setLoading] = useState(true); // Start as true

  useEffect(() => {
    // 1. Ensure loading is true when the effect starts
    setLoading(true);

    fetch("/card/products.json")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data: unknown) => {
        setProducts(data);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch products:", err);
      })
      .finally(() => {
        // 2. This runs whether the fetch succeeded or failed
        setLoading(false);
      });
  }, []);

  // 3. Conditional Rendering
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  // handle add to cart button action
  const handleClick = (product: unknown) => {
    // code here
  };
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 my-gap my-my">
      {mapList(sliceOf(products, 0, 4), (product) => (
        <CardMain
          key={idKey(product)}
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
        ></CardMain>
      ))}
    </div>
  );
};

export default Products;
