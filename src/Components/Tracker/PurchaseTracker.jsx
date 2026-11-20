"use client";

import { useEffect } from "react";

// Format a number as a fixed 2-decimal string, e.g. "875.00"
const money = (val) => (Number(val) || 0).toFixed(2);

export default function PurchaseTracker({ order }) {
    
    useEffect(() => {
        if (!order || window.__purchase_fired) return;

        window.__purchase_fired = true;

        const items =
            order?.order_lists?.map((item, index) => ({
                item_name: item?.product?.product_name || ".",
                item_brand: item?.product?.brand?.name || "",
                item_id: String(item?.product_id || item?.product_variant_id || ""),
                item_sku: item?.variant?.sku || "",
                price: money(item?.product_price || 0),
                imageUrl:item?.product?.product_image || "",
                item_variant: item?.variant?.attribute_values?.map(item => item.value).join(',')  || "",
                item_category: item?.product?.category?.name || "",
                item_category2: item?.product?.category?.parent?.name || "",
                discount: money(item?.discount_amount),
                quantity: item?.quantity || 1,
                index: index + 1,
            })) || [];

        const shippingAddress = order?.shipping_address || order?.billing_address || {};
        const contact = order?.contact || {};


        
        window.dataLayer = window.dataLayer || [];

        window.dataLayer.push({
            event: "purchase",
            ecommerce: {
                transaction_id: order?.invoice_number,
                value: money(order?.grand_total),
                tax: 0,
                shipping: money(order?.shipping_charge),
                currency: "BDT",
                coupon: order?.coupon_code || "",
                discount_amount: money(order?.discount_amount),
                items: items,
            },
            user_data: {
                billing_first_name: shippingAddress?.contact?.name || contact?.name || "",
                billing_address: shippingAddress?.street || order.address || "",
                billing_country: "BD",
                billing_state: shippingAddress?.district?.name || order?.district?.name || "",
                billing_city: shippingAddress?.area?.name || order?.area?.name || "",
                billing_phone: shippingAddress?.contact?.phone || contact?.phone || "",
                new_customer: order.order_count > 1 ? "false" : "true",
            },
        });

    }, [order]);

    return null;
}
