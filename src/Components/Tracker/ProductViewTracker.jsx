"use client";

import { useEffect } from "react";

export default function ProductViewTracker({ product }) {
    useEffect(() => {
        if (!product) return;

        const variants = product?.variants || [];

        const selectedVariant =
            variants.find((variant) => variant.stock === true) || variants[0];

        const price = selectedVariant?.regular_price || 0;

        window.dataLayer = window.dataLayer || [];

        window.dataLayer.push({
            event: "view_item",
            ecommerce: {
                value: price,
                currency: "BDT",
                items: [
                    {
                        item_id: product.id,
                        item_name: product.product_name,
                        item_brand: product.brand?.name,
                        item_category: product.category?.name,
                        price: price,
                        quantity: 1,
                    },
                ],
            },
        });
    }, [product]);

    return null;
}