import {cookies} from "next/headers";
import {NextResponse} from "next/server";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

// these work for guests during checkout — no auth_token yet
const GUEST_ENDPOINTS = [
    "/customer/gust-phone-verify-request",
    "/customer/gust-phone-verify",
    "/customer/gust-buy-now",
    "/customer/warranty-claims",
];

export async function POST(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const endpoint = formData.get("_endpoint");
        formData.delete("_endpoint");

        if (!token && !GUEST_ENDPOINTS.includes(endpoint)) {
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const response = await fetch(`${BASE_API_URL}${endpoint}`, {
            method: "POST",
            headers: {
                ...(token && {Authorization: `Bearer ${token}`}),
                ...(INTERNAL_API_TOKEN && {"X-Internal-Token": INTERNAL_API_TOKEN}),
            },
            body: formData,
        });

        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    }

    const {endpoint, method, body} = await request.json();

    if (!token && !GUEST_ENDPOINTS.includes(endpoint)) {
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
        method: method || "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token && {Authorization: `Bearer ${token}`}),
            ...(INTERNAL_API_TOKEN && {"X-Internal-Token": INTERNAL_API_TOKEN}),
        },
        ...(body && {body: JSON.stringify(body)}),
    });

    const data = await response.json();
    return NextResponse.json(data, {status: response.status});
}