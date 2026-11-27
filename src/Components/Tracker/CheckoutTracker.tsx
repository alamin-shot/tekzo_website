"use client";

import { useEffect } from "react";
import type { CheckoutTrackerProps } from "@/types/props/layout";
import { pushDataLayer } from "@/tracking/dataLayer";
import { fieldsOf, orList, rec, requireString } from "@/lib/json";

// `cartItems?.length` as the JS read it (strings and arrays have a length).
const lengthOf = (value: unknown): unknown => (typeof value === "string" ? value.length : rec(value)?.length);

export default function CheckoutTracker({ cartItems }: CheckoutTrackerProps) {
  useEffect(() => {
    if (!lengthOf(cartItems)) return;
    // A non-array with a length threw at `.map` before; orList keeps that.
    const list = orList(cartItems);

    const items = list.map((entry) => {
      const item = fieldsOf(entry); // `item.productId` threw for a null entry
      const variant = rec(item.variant);
      const product = rec(item.product);
      return {
        item_id: item.productId || item.id || item.product_id || variant?.product_id,
        item_name: product?.product_name,
        item_brand: rec(product?.brand)?.name || rec(item.brand)?.name,
        item_category: rec(product?.category)?.name || rec(item.category)?.name,
        quantity: item.quantity || 1,
        price: variant?.final_price || 0,
        item_variant: variant?.attribute_value ? requireString(variant.attribute_value).split(",").join("/") : "",
        item_sku: variant?.sku,
      };
    });

    // `sum + (final_price || 0) * (quantity || 1)` — `*` applies ToNumber.
    const totalValue = list.reduce<number>((sum, entry) => {
      const item = rec(entry);
      return sum + Number(rec(item?.variant)?.final_price || 0) * Number(item?.quantity || 1);
    }, 0);

    pushDataLayer({
      event: "begin_checkout",
      ecommerce: {
        currency: "BDT",
        value: totalValue,
        items: items,
      },
    });
  }, [cartItems]);

  return null;
}
