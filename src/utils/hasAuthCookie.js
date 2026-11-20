export default function hasAuthCookie() {
    if (typeof document === "undefined") return false;
    return document.cookie.split("; ").some((c) => c.startsWith("has_auth="));
}
