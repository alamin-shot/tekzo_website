# Module: Auth & Middleware (Proxy)
**Path:** `src/proxy.js`, `src/Components/Login/*`, `src/app/(main)/login/*`, `src/app/api/logout/route.js`, `src/utils/getAuthUser.js`, `src/fetch-API/getAuthUser.js`, `src/utils/hasAuthCookie.js`, `src/Components/ReuseableComponent/LoginPage/*`

## 1. Critical Bugs & Security Risks
- **An API outage logs every user out (CONFIRMED).** In `proxy.js:66-76`, every `/dashboard/*` request does a blocking `fetch` to `/customer/profile`. Its `catch` calls `redirectToLogin()`, which **deletes `auth_token` and `has_auth`** (lines 82-86). With the current Cloudflare 522 outage, or any network blip, any logged-in user who opens the dashboard loses their session. Only a definite `401` should clear cookies. Network errors and 5xx responses should fail open (show an error page) or retry.
- **Open redirect after login (CONFIRMED).** `Components/Login/actions.js:45-47` accepts any `redirect` value that `startsWith("/")`. `//evil.example.com` passes that check and is a protocol-relative external URL, so `redirect()` sends a freshly authenticated user off-site. This is classic phishing material. Validate that the value starts with `/`, does **not** start with `//` or `/\`, and parses to the same origin.
- **`fetchAPI` is a public Server Action.** `utils/fetchAPI.js` is marked `"use server"` and is imported by client components (see `02-search-bug.md` §1.6). Any visitor can invoke it with an arbitrary endpoint, method and body, and it runs server-side with the caller's cookie token. Auth helpers built on it inherit that exposure. The same applies to `fetch-API/getAuthUser.js` and `fetch-API/getRecentOrder.js`, also `"use server"`.
- **Three profile fetches per dashboard navigation.** `proxy.js` makes the first, `dashboard/layout.jsx` → `fetch-API/getAuthUser()` (server) the second, and `NavAuthClient.jsx:43-53` → `utils/getAuthUser()` (client, via the BFF, on **every pathname change**) the third. That is latency plus backend load, and it means three separate sources of truth for "who is logged in".
- **PII cached in `localStorage`.** `NavAuthClient.jsx:15-25,48` stores the full profile object under `cachedNavUser` (name, e-mail, phone, avatar, and whatever else the backend returns). It survives logout until the next `getAuthUser()` resolves and is readable by any injected script, including the GTM-loaded third-party pixels. Cache only `{ name, avatarUrl }`, and clear it inside the logout flow.
- **No CSRF or origin check on the custom POST route handlers.** `api/logout` and `api/client-fetch` rely solely on `SameSite=Lax`. That is acceptable for now, but add an `Origin`/`Sec-Fetch-Site` check as defense in depth. Server Actions get this check automatically; route handlers do not.
- **No token refresh or expiry handling.** The cookie is a static 7-day bearer token (`actions.js:32`). When the backend token expires earlier, the UI keeps `has_auth=1`, `hasAuthCookie()` returns true, and client calls fail with 401 until the proxy clears cookies on the next dashboard hit.
- **Registration validation** (`actions.js:60-75`) only checks that the two passwords match. There is no length, e-mail, phone or trimming validation server-side in the Next layer; everything is delegated to the backend, and raw backend messages are surfaced to users.
- **`reset-password/page.jsx` (704 lines, `"use client"`)** calls the API directly with `fetch(url…)` (line 50) from the browser. That puts the OTP and new-password flow on the cross-origin path, with no BFF, no rate-limit shielding and no Zod validation. Inferred from size: OTP timer and resend logic are client-only, so a page refresh resets the resend throttle.
- `PUBLIC_ROUTES` includes `/register` (`proxy.js:4`, matcher line 93), but no `/register` route exists in `src/app`. Either it is dead config or there is a missing page.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:**
  - `NavAuthClient.jsx` fetches the user on the client after hydration, although the `(main)` layout is already a Server Component that could read the cookie and resolve the user once. Pass `user` down, or hydrate a Redux `auth` slice from the server.
  - `reset-password/page.jsx` is a full client page. Only the OTP input widget needs to be a client component; the step logic should be Server Actions or a BFF route.
  - `utils/getAuthUser.js` (client) and `fetch-API/getAuthUser.js` (server) export the **same function name** with different runtimes. That makes accidental wrong-side imports easy.
- **State Management:**
  - Auth state is spread across an httpOnly cookie, a readable `has_auth` cookie, `localStorage.cachedNavUser`, the `NavAuthClient` local state and a `userProfileUpdated` window `CustomEvent`. Consolidate into one Redux Toolkit `auth` slice (hydrated from the server) and drop the window-event bus.
- **File Size:**
  - `login/reset-password/page.jsx` (704 lines): split into `EmailStep`, `OtpStep`, `NewPasswordStep`, a `useOtpTimer` hook and a `resetPassword` service.
  - `Components/Login/LoginPage.jsx` (283 lines): split into the form, the toggle and the animation shell.
  - `Components/Login/actions.js` (111 lines): extract a shared `setSessionCookies(token)` helper, because lines 27-43 and 88-102 are identical.
  - `proxy.js` (105 lines): move `STATIC_REDIRECTS`/`resolveLegacyRedirect` into `lib/legacyRedirects.js`, or into `next.config` `redirects()`, where they belong.
- **TypeScript:** auth payloads are untyped (`data?.data?.access_token`). Add Zod schemas for `LoginInput`, `RegisterInput`, `AuthResponse` and `CustomerProfile`, and validate `formData` before calling the backend.

## 3. Duplication & Technical Debt
- `getAuthUser` is implemented twice (`utils/` and `fetch-API/`). Keep one server version (`lib/auth/getSessionUser.ts`, `server-only`) and one client hook (`useAuth()` reading the Redux slice).
- Cookie-setting code is duplicated in `loginAction` and `registerAction`.
- Cookie deletion is duplicated in `proxy.js:84-85` and `api/logout/route.js:21-22`. Centralize `clearSession()`.
- The legacy SEO redirects in `proxy.js` run in the middleware layer on every matched request, although they are static. `next.config.mjs` `redirects()` is declarative, cached and cheaper.

## 4. Data Fetching & Performance
- The proxy's blocking profile check adds a full backend round trip before **every** dashboard navigation, prefetches included. Validate the token's existence or signature in the proxy only, and let the dashboard layout do the real check once.
- `NavAuthClient` re-fetches the profile on every route change (`[pathname]` dependency) across the whole storefront, not just after login.
- The login page loads Lottie (`login-animation.json`, about 210 KB) through `dynamic(..., { ssr:false })`. It is gated correctly, but it is still heavy for a decorative element. Consider a static WebP/AVIF or CSS animation.

## 5. Actionable Refactor Checklist
- [ ] 1. In `proxy.js`, only clear cookies on a definite `401`/`403`. On network errors or 5xx, let the request through, or render a maintenance or error page, without deleting the session.
- [ ] 2. Fix the open redirect in `loginAction`: reject values starting with `//` or `/\`, and require `new URL(value, origin).origin === origin`.
- [ ] 3. Remove `"use server"` from `utils/fetchAPI.js`, `fetch-API/getAuthUser.js` and `fetch-API/getRecentOrder.js`, and mark them `server-only`. Expose only explicit, narrowly-scoped Server Actions for mutations.
- [ ] 4. Create one Redux Toolkit `auth` slice. Hydrate it from the server layout (one profile fetch per request, using React `cache()`), and remove `localStorage.cachedNavUser`, the `userProfileUpdated` window event and the per-route client refetch.
- [ ] 5. Reduce profile calls to one per navigation: the proxy checks cookie presence only, and the layout resolves the user.
- [ ] 6. Extract `setSessionCookies()` and `clearSession()` helpers, and call `clearSession()` from logout, the proxy and 401 handlers. Clear any client caches on logout.
- [ ] 7. Add Zod validation for login, register and reset-password inputs on the server. Map backend errors to user-safe messages.
- [ ] 8. Move the reset-password flow behind BFF routes or Server Actions, and persist OTP resend throttling server-side.
- [ ] 9. Move the legacy URL redirects into `next.config.mjs` `redirects()`. Remove `/register` from proxy config, or build the page.
- [ ] 10. Add an `Origin` header check to the `api/logout` and `api/client-fetch` POST handlers.
- [ ] 11. Split `reset-password/page.jsx` and `LoginPage.jsx` under 100 lines each, and convert to TypeScript.
