const stripTrailingSlash = (value = "") => String(value || "").replace(/\/+$/, "");

const isLoopbackHost = (host = "") =>
    ["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0"].includes(host);

export const getApiUrl = () => {
    const configuredUrl =
        import.meta.env.VITE_BACKEND_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000";

    const normalizedUrl = stripTrailingSlash(configuredUrl);

    if (typeof window === "undefined") return normalizedUrl;

    try {
        const apiUrl = new URL(normalizedUrl);
        const frontendHost = window.location.hostname;

        if (isLoopbackHost(apiUrl.hostname) && !isLoopbackHost(frontendHost)) {
            apiUrl.hostname = frontendHost;
            return stripTrailingSlash(apiUrl.toString());
        }
    } catch {
        return normalizedUrl;
    }

    return normalizedUrl;
};

export const withFreshParam = (url) => {
    const separator = String(url).includes("?") ? "&" : "?";
    return `${url}${separator}_=${Date.now()}`;
};

export const fetchFreshJson = async (url, options = {}) => {
    const response = await fetch(withFreshParam(url), {
        cache: "no-store",
        ...options,
        headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        throw new Error(`[${response.status}] ${response.statusText || "Error al obtener datos"}`);
    }

    return response.json();
};
