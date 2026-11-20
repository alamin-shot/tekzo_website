const clientFetchAPI = async (endpoint, method = "POST", body = null) => {
    const isFormData = body instanceof FormData;

    if (isFormData) {
        body.append("_endpoint", endpoint);

        const response = await fetch("/api/client-fetch", {
            method: "POST",
            body: body,
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data?.message || "Something went wrong");
            error.status = response.status;
            error.errors = data?.errors || null;
            throw error;
        }

        return data;
    }

    const response = await fetch("/api/client-fetch", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({endpoint, method, body}),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data?.message || "Something went wrong");
        error.status = response.status;
        error.errors = data?.errors || null;
        throw error;
    }

    return data;
};

export default clientFetchAPI;