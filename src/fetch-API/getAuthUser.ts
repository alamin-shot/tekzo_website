"use server";
import fetchAPI from "@/utils/fetchAPI";
import { cookies } from "next/headers";
import { rec } from "@/lib/json";

export async function getAuthUser(): Promise<unknown> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        return null;
    }

    try {
        const data = await fetchAPI("/customer/profile");
        return rec(data)?.data || null;
    } catch (error) {
        return null;
    }
}