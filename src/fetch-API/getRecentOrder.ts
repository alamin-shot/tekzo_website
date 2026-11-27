"use server";

import fetchAPI from "@/utils/fetchAPI";
import { rec } from "@/lib/json";

async function fetchWithAuth(endpoint: string): Promise<unknown> {
    try {
        const data = await fetchAPI(endpoint);
        return rec(data)?.data ?? null;
    } catch (error) {


        return null;
    }
}

export const getRecentOrder = async () => fetchWithAuth("/customer/recent-orders");
export const getStatistics = async () => fetchWithAuth("/customer/statistics");
export const getDefaultShippingAndBillingAddress = async () => fetchWithAuth("/customer/default-address");