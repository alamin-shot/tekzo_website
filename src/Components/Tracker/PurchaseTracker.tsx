"use client";

import { useEffect } from "react";
import type { PurchaseTrackerProps } from "@/types/props/layout";
import { pushDataLayer } from "@/tracking/dataLayer";
import { fieldsOf, mapOpt, rec } from "@/lib/json";

// Format a number as a fixed 2-decimal string, e.g. "875.00"
const money = (val: unknown): string => (Number(val) || 0).toFixed(2);

export default function PurchaseTracker({ order }: PurchaseTrackerProps) {
  useEffect(() => {
    if (!order) return;
    const o = rec(order);
    // F1: fire `purchase` once per invoice (survives reloads and the "Initiated"
    // re-checks on the success page); without an invoice, once per page as before.
    const invoice = o?.invoice_number;
    const key = invoice ? `purchase_fired:${String(invoice)}` : "";
    if (key ? sessionStorage.getItem(key) : window.__purchase_fired) return;
    if (key) sessionStorage.setItem(key, "1");
    else window.__purchase_fired = true;

    const items =
      mapOpt(o?.order_lists, (entry, index) => {
        const item = rec(entry);
        const product = rec(item?.product);
        const variant = rec(item?.variant);
        return {
          item_name: product?.product_name || ".",
          item_brand: rec(product?.brand)?.name || "",
          item_id: String(item?.product_id || item?.product_variant_id || ""),
          item_sku: variant?.sku || "",
          price: money(item?.product_price || 0),
          imageUrl: product?.product_image || "",
          // `item.value` threw for a null attribute entry; fieldsOf keeps that.
          item_variant: mapOpt(variant?.attribute_values, (v) => fieldsOf(v).value)?.join(",") || "",
          item_category: rec(product?.category)?.name || "",
          item_category2: rec(rec(product?.category)?.parent)?.name || "",
          discount: money(item?.discount_amount),
          quantity: item?.quantity || 1,
          index: index + 1,
        };
      }) || [];

    const shippingAddress = rec(o?.shipping_address || o?.billing_address || {});
    const contact = rec(o?.contact || {});

    pushDataLayer({
      event: "purchase",
      ecommerce: {
        transaction_id: o?.invoice_number,
        value: money(o?.grand_total),
        tax: 0,
        shipping: money(o?.shipping_charge),
        currency: "BDT",
        coupon: o?.coupon_code || "",
        discount_amount: money(o?.discount_amount),
        items: items,
      },
      user_data: {
        billing_first_name: rec(shippingAddress?.contact)?.name || contact?.name || "",
        billing_address: shippingAddress?.street || o?.address || "",
        billing_country: "BD",
        billing_state: rec(shippingAddress?.district)?.name || rec(o?.district)?.name || "",
        billing_city: rec(shippingAddress?.area)?.name || rec(o?.area)?.name || "",
        billing_phone: rec(shippingAddress?.contact)?.phone || contact?.phone || "",
        new_customer: Number(o?.order_count) > 1 ? "false" : "true",
      },
    });
  }, [order]);

  return null;
}
