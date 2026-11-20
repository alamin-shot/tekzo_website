const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchPublicAPI = async (endpoint, options = {}) => {
  const url = `${BASE_API_URL}${endpoint}`;

  const { tags, revalidate, next, headers, ...rest } = options;

  const nextOptions = {
    ...(next || {}),
    ...(tags && { tags }),
    ...(revalidate !== undefined && { revalidate }),
  };

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      ...(Object.keys(nextOptions).length > 0 && { next: nextOptions }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data?.message || `HTTP error! status: ${response.status}`,
      );
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error(`API fetch error [${endpoint}]:`, error.message);
    throw error;
  }
};

export default fetchPublicAPI;
