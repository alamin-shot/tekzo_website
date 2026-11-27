"use client";

import { useEffect } from "react";
import type { ProductViewTrackerProps } from "@/types/props/layout";
import { pushDataLayer } from "@/tracking/dataLayer";
import { fieldsOf, orList, rec } from "@/lib/json";

export default function ProductViewTracker({ product }: ProductViewTrackerProps) {
  useEffect(() => {
    if (!product) return;
    const p = rec(product);

    const variants = orList(p?.variants || []);

    // `variant.stock` on a null entry threw before; fieldsOf keeps that.
    const selectedVariant = variants.find((variant) => fieldsOf(variant).stock === true) || variants[0];

    const price = rec(selectedVariant)?.regular_price || 0;

    pushDataLayer({
      event: "view_item",
      ecommerce: {
        value: price,
        currency: "BDT",
        items: [
          {
            item_id: p?.id,
            item_name: p?.product_name,
            item_brand: rec(p?.brand)?.name,
            item_category: rec(p?.category)?.name,
            price: price,
            quantity: 1,
          },
        ],
      },
    });
  }, [product]);

  return null;
}
