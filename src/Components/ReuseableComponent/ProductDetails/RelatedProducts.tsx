import React, { Suspense } from "react";
import Card from "../Card";
import CardMain from "../CardMain";
import type { RelatedProductsProps } from "@/types/props/product";
import { mapOpt, rec } from "@/lib/json";
import { idKey } from "@/lib/render";

const RelatedProducts = ({ relatedProductsData }: RelatedProductsProps) => {
  return (
    <div className=" pt-5 lg:pt-10">
      <div className="py-4">
        <h2 className="text-2xl lg:text-3xl font-medium capitalize text-gray-700">Related Products</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 my-gap">
        <Suspense fallback={"loading....."}>
          {mapOpt(relatedProductsData, (product) => (
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
              isStock={rec(product)?.is_stock}
              rating={rec(product)?.rating}
              image={rec(product)?.product_image}
              link={rec(product)?.slug}
              brandName={rec(rec(product)?.category)?.name}
              brandLink={rec(rec(product)?.category)?.slug}
              from={"relatedProduct"}
            />
          ))}
        </Suspense>
      </div>
    </div>
  );
};

export default RelatedProducts;
