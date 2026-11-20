"use server";

import fetchAPI from "@/utils/fetchAPI";

export async function submitContactForm(prevState, formData) {
    const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    };

    try {
        const data = await fetchAPI("/contacts", {
            method: "POST",
            Accept: "application/json",
            body: JSON.stringify(payload),
        });

        return {
            success: true,
            message: data?.message || "Message sent successfully!",
        };
    } catch (error) {
        return {
            success: false,
            message: error?.message || "Something went wrong. Please try again.",
            errors: error?.errors || null,
        };
    }
}