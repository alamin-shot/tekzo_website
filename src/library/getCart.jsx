"use server";

import {cookies} from "next/headers";
import fetchAPI from "@/utils/fetchAPI";

export async function getCart() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return {items: [], grandTotal: 0};
        }

        const result = await fetchAPI("/customer/carts");

        const payload = result?.data ?? {};

        return {
            items: payload.cartItems || [],
            grandTotal: payload.grandTotal ?? 0,
        };
    } catch (err) {
        console.error("Cart fetch error:", err.message);
        return {items: [], grandTotal: 0};
    }
}