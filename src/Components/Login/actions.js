"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import fetchAPI from "@/utils/fetchAPI";

export async function loginAction(prevState, formData) {
    const payload = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    let redirectTo = "/";

    try {
        const data = await fetchAPI("/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        const token = data?.data?.access_token;

        if (!token) {
            return { success: false, message: "Invalid response from server." };
        }

        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });
        // readable (non-httpOnly) marker so client components can skip
        // authenticated calls without needing a round trip
        cookieStore.set("has_auth", "1", {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        const redirectParam = formData.get("redirect");
        if (redirectParam && redirectParam.startsWith("/")) {
            redirectTo = redirectParam;
        }
    } catch (error) {
        return {
            success: false,
            message: error?.message || "Login failed. Please try again.",
            errors: error?.errors || null,
        };
    }

    redirect(redirectTo);
}

export async function registerAction(prevState, formData) {
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match!", errors: null };
    }

    const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password,
        password_confirmation: confirmPassword,
    };

    try {
        const data = await fetchAPI("/auth/register", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        const token = data?.data?.access_token;

        if (!token) {
            return { success: false, message: "Invalid response from server." };
        }

        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        cookieStore.set("has_auth", "1", {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
    } catch (error) {
        return {
            success: false,
            message: error?.message || "Registration failed. Please try again.",
            errors: error?.errors || null,
        };
    }

    redirect("/");
}