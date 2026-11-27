// Client-readable `has_auth` marker kept in sync with the httpOnly auth_token
// by src/proxy.ts. False on the server.
export default function hasAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith("has_auth="));
}
