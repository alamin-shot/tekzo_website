import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (token) {
        try {
            await fetch(`${BASE_API_URL}/customer/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...(INTERNAL_API_TOKEN && { "X-Internal-Token": INTERNAL_API_TOKEN }),
                },
            });
        } catch {
            // ignore — clear the local session regardless of backend result
        }
    }

    cookieStore.delete("auth_token");
    cookieStore.delete("has_auth");

    return NextResponse.json({ success: true });
}
