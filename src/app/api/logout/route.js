import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (token) {
        try {
            await fetch(`${BASE_API_URL}/customer/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            // ignore — clear the local session regardless of backend result
        }
    }

    cookieStore.delete("auth_token");
    cookieStore.delete("has_auth");

    return NextResponse.json({ success: true });
}
