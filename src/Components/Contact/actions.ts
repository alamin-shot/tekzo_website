"use server";

import fetchAPI from "@/utils/fetchAPI";
import type { ContactFormState } from "@/types/props/content";
import { rec } from "@/lib/json";

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
    const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    };

    try {
        // N19: `Accept` here is not a header (fetch ignores this key); kept as it was.
        const options = {
            method: "POST",
            Accept: "application/json",
            body: JSON.stringify(payload),
        };
        const data = await fetchAPI("/contacts", options);

        return {
            success: true,
            message: rec(data)?.message || "Message sent successfully!",
        };
    } catch (error) {
        return {
            success: false,
            message: rec(error)?.message || "Something went wrong. Please try again.",
            errors: rec(error)?.errors || null,
        };
    }
}