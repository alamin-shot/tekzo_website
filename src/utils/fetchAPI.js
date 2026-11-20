"use server";

import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchAPI = async (endpoint, options = {}) => {
    const url = `${BASE_API_URL}${endpoint}`;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(
                data?.message || `HTTP error! status: ${response.status}`
            );
            error.status = response.status;
            error.errors = data?.errors || null;
            throw error;
        }

        return data;
    } catch (error) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

        if (error?.status === 401) {
            throw error;
        }

        console.error(`API fetch error [${endpoint}]:`, error.message);
        throw error;
    }
};

export default fetchAPI;