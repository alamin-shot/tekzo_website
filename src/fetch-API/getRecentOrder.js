"use server";

import fetchAPI from "@/utils/fetchAPI";

async function fetchWithAuth(endpoint) {
    try {
        const data = await fetchAPI(endpoint);
        return data?.data ?? null;
    } catch (error) {


        return null;
    }
}

export const getRecentOrder = async () => fetchWithAuth("/customer/recent-orders");
export const getStatistics = async () => fetchWithAuth("/customer/statistics");
export const getDefaultShippingAndBillingAddress = async () => fetchWithAuth("/customer/default-address");