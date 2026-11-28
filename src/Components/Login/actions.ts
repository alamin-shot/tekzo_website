"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthActionState } from "@/types/auth";
import type { SocialAuthResult } from "@/types/social";
import { RATE_LIMIT_MESSAGE, apiStatus, socialErrorMessage } from "@/lib/http/apiErrorMessage";
import { isSocialProvider } from "@/lib/socialAuth";
import fetchAPI from "@/utils/fetchAPI";
import { errMessage, rec, requireString } from "@/lib/json";

// Same cookies for every sign-in path (password, register, social).
async function setAuthCookies(token: unknown): Promise<void> {
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
}

export async function loginAction(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const payload = {
    login: formData.get("login"),
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

    await setAuthCookies(token);

    const redirectParam = formData.get("redirect");
    // `.startsWith` on a non-string (a File) threw inside this try before; kept.
    if (redirectParam && requireString(redirectParam).startsWith("/")) {
      redirectTo = requireString(redirectParam);
    }
  } catch (error) {
    return {
      success: false,
      message: apiStatus(error) === 429 ? RATE_LIMIT_MESSAGE : errMessage(error) || "Login failed. Please try again.",
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

    await setAuthCookies(token);
  } catch (error) {
    return {
      success: false,
      message: apiStatus(error) === 429 ? RATE_LIMIT_MESSAGE : errMessage(error) || "Registration failed. Please try again.",
      errors: rec(error)?.errors || null,
    };
  }

  redirect("/");
}

// Social sign-in (UPD-003): exchange a provider token for our access token.
// Returns instead of redirecting so the client can do a full navigation
// (the navbar re-reads the new cookie).
export async function socialLoginAction(provider: unknown, token: unknown, name: unknown, redirectParam: unknown): Promise<SocialAuthResult> {
  if (!isSocialProvider(provider) || typeof token !== "string" || !token) {
    return { success: false, message: "Sign-in failed. Please try again." };
  }
  try {
    const data = await fetchAPI(`/auth/social/${provider}`, {
      method: "POST",
      body: JSON.stringify(typeof name === "string" && name ? { token, name } : { token }),
    });
    const accessToken = rec(rec(data)?.data)?.access_token;
    if (!accessToken) return { success: false, message: "Invalid response from server." };
    await setAuthCookies(accessToken);
    const redirectTo = typeof redirectParam === "string" && redirectParam.startsWith("/") ? redirectParam : "/";
    return { success: true, message: "", redirectTo };
  } catch (error) {
    return { success: false, message: socialErrorMessage(error, provider) };
  }
}
