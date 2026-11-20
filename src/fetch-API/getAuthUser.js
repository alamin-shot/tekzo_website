"use server";
import fetchAPI from "@/utils/fetchAPI";
import { cookies } from "next/headers";

export async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        return null;
    }

    try {
        const data = await fetchAPI("/customer/profile");
        return data?.data || null;
    } catch (error) {
        return null;
    }
}