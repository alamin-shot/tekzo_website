"use client";

import { useEffect, useState } from "react";
import Card from "../ReuseableComponent/Card";
import Loader from "../Loader/Loader";
import CardMain from "../ReuseableComponent/CardMain";

const Products = ({ link }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Start as true

  useEffect(() => {
    // 1. Ensure loading is true when the effect starts
    setLoading(true);

    fetch("/card/products.json")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
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
  const handleClick = (product) => {
    // code here
  };
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 my-gap my-my">
      {products.slice(0, 4).map((product) => (
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
          rating={product?.rating}
          image={product?.product_image}
          link={product?.slug}
        ></CardMain>
      ))}
    </div>
  );
};

export default Products;
