"use client";

import { useEffect } from "react";

export default function CheckoutTracker({ cartItems }) {

    useEffect(() => {
        if (!cartItems?.length) return;

        const items = cartItems.map((item) => ({
            item_id:  item.productId || item?.id || item?.product_id || item?.variant?.product_id,
            item_name: item?.product?.product_name,
            item_brand: item?.product?.brand?.name || item?.brand?.name,
            item_category: item?.product?.category?.name || item?.category?.name,
            quantity: item?.quantity || 1,
            price: item?.variant?.final_price || 0,
            item_variant: item?.variant?.attribute_value ? item?.variant?.attribute_value.split(',').join('/') : '',
            item_sku: item?.variant?.sku,
        }));

        const totalValue = cartItems.reduce(
            (sum, item) =>
                sum + (item?.variant?.final_price || 0) * (item?.quantity || 1),
            0
        );

        window.dataLayer = window.dataLayer || [];

        window.dataLayer.push({
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