"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthActionState } from "@/types/auth";
import fetchAPI from "@/utils/fetchAPI";
import { errMessage, rec, requireString } from "@/lib/json";

export async function loginAction(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
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

    const token = rec(rec(data)?.data)?.access_token;

    if (!token) {
      return { success: false, message: "Invalid response from server." };
    }

    const cookieStore = await cookies();
    // (cookies().set stringifies the value; tokens are strings from the API)
    cookieStore.set("auth_token", String(token), {
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
    // `.startsWith` on a non-string (a File) threw inside this try before; kept.
    if (redirectParam && requireString(redirectParam).startsWith("/")) {
      redirectTo = requireString(redirectParam);
    }
  } catch (error) {
    return {
      success: false,
      message: errMessage(error) || "Login failed. Please try again.",
      errors: rec(error)?.errors || null,
    };
  }

  redirect(redirectTo);
}

export async function registerAction(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
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

    const token = rec(rec(data)?.data)?.access_token;

    if (!token) {
      return { success: false, message: "Invalid response from server." };
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_token", String(token), {
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
      message: errMessage(error) || "Registration failed. Please try again.",
      errors: rec(error)?.errors || null,
    };
  }

  redirect("/");
}
