import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {fieldsOf} from "@/lib/json";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

// these work for guests during checkout — no auth_token yet
// KNOWN BUG #3 (preserved): /customer/gust-check-coupon and /order-tracking
// are called by guests but are not listed here, so guests get 401.
const GUEST_ENDPOINTS = [
    "/customer/gust-phone-verify-request",
    "/customer/gust-phone-verify",
    "/customer/gust-buy-now",
    "/customer/gust-check-coupon",
    "/order-tracking",
    "/customer/warranty-claims",
];

// `GUEST_ENDPOINTS.includes(endpoint)` for an endpoint of any type.
const isGuestEndpoint = (endpoint: unknown): boolean => GUEST_ENDPOINTS.some((e) => e === endpoint);

export async function POST(request: NextRequest): Promise<NextResponse> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const endpoint = formData.get("_endpoint");
        formData.delete("_endpoint");

        if (!token && !isGuestEndpoint(endpoint)) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const response = await fetch(`${BASE_API_URL}${endpoint}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                ...(token && {Authorization: `Bearer ${token}`}),
                ...(INTERNAL_API_TOKEN && {"X-Internal-Token": INTERNAL_API_TOKEN}),
            },
            body: formData,
        });

        const data: unknown = await response.json();
        return NextResponse.json(data, {status: response.status});
    }

    const payload: unknown = await request.json();
    const {endpoint, method, body} = fieldsOf(payload);

    if (!token && !isGuestEndpoint(endpoint)) {
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
        // fetch stringifies `method` itself; String() is the same conversion.
        method: String(method || "POST"),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token && {Authorization: `Bearer ${token}`}),
            ...(INTERNAL_API_TOKEN && {"X-Internal-Token": INTERNAL_API_TOKEN}),
        },
        ...(body ? {body: JSON.stringify(body)} : {}),
    });

    const data: unknown = await response.json();
    return NextResponse.json(data, {status: response.status});
}