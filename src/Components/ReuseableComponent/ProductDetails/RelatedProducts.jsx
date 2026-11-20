import React, { Suspense } from "react";
import Card from "../Card";
import CardMain from "../CardMain";

const RelatedProducts = ({ relatedProductsData }) => {
  return (
    <div className=" pt-5 lg:pt-10">
      <div className="py-4">
        <h2 className="text-2xl lg:text-3xl font-medium capitalize text-gray-700">Related Products</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 my-gap">
        <Suspense fallback={"loading....."}>
          {relatedProductsData?.map((product) => (
            <CardMain
              key={product.id}
              product={product}
              name={product?.product_name}
              discountPrice={product?.discount_price}
              currentPrice={product?.final_price}
              originalPrice={product?.regular_price}
              discount={product?.discount_amount}
              discountPercentage={product?.discount_label}
              discountAmount={product?.discount_amount}
              isStock={product?.is_stock}
              rating={product?.rating}
              image={product?.product_image}
              link={product?.slug}
              brandName={product?.category?.name}
              brandLink={product?.category?.slug}
              from={"relatedProduct"}
            />
          ))}
        </Suspense>
      </div>
    </div>
  );
};

export default RelatedProducts;
