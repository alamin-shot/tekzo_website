# Module: Traffic Spike Forensic Investigation (DigitalOcean block)
**Path:** whole repository (`src/`, `public/`, root configs, `package.json`, `package-lock.json`, installed `node_modules` versions)

> Investigation date: 2026-11-19, commit `6f88ab4`. Read-only: no application code was changed.
> **Method:**
> - pattern scans (grep with PCRE);
> - an **AST scan of every `useEffect`/`useLayoutEffect` in `src/`** (Babel parser) that checked for missing dependency arrays and for effects that set state they also depend on;
> - a timer and cleanup audit;
> - a lockfile source audit;
> - `npm audit --omit=dev` against the installed dependency tree;
> - an inventory of external domains.
>
> **Context:** at analysis time, `web-api.tekzo.com.bd` and `www.tekzo.com.bd` both returned Cloudflare **522** (origin unreachable). That is consistent with DigitalOcean having null-routed or blocked the droplet that serves them.

---

## Root Cause

**The repository contains no malware, no cryptominer, no botnet script and no infinite loop capable of producing a DigitalOcean-level traffic burst.** The most likely cause is that **the server was compromised through known, critical, unauthenticated RCE vulnerabilities in the installed `next@16.1.4`**. The attacker's payload (typically a cryptominer and/or DDoS/scanner bot) then generated the outbound traffic that DigitalOcean's abuse system blocked. Abuse blocks are almost always triggered by **outbound** floods, scans or mining-pool traffic, not by a site's own API calls.

Evidence:

1. **`npm audit` flags `next@16.1.4` as CRITICAL** (fixed in `16.4.6`). Its advisories include:
   - `GHSA-2xp9-vwfh-vxw4`: *Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used* (< 16.3.3). **This project explicitly enables AVIF**: `next.config.mjs` sets `images.formats: ["image/avif", "image/webp"]`.
   - `GHSA-2464-fhr4-w9xw`: *Unauthenticated RCE in Image Optimization API when SVG files are used* (≤ 16.4.0). The app passes many SVGs through `next/image` (`/Chinese.svg`, `/navbar/navbar-middle.svg`, `/payment-logo/*.svg`, `/pointCardLogo.svg`, `/Offer.svg`).
   - `GHSA-673q-mjm6-r5xr` (RCE in `use cache`), `GHSA-p293-qw3h-jr36` (RCE on Windows hosts), plus SSRF in Image Optimization (`GHSA-cjq9-62q9-8jv4`), SSRF in Server Actions, proxy/middleware bypasses, and multiple DoS issues.
   - **`sharp`** (libvips, libheif, librsvg) also carries HIGH advisories. sharp is the library the image optimizer runs on attacker-supplied images.
2. **The droplet was already showing a miner-like symptom.** The comment in `next.config.mjs` records **"94-96% CPU load on the pm2 server"**, blamed on AVIF encoding. Sustained near-100% CPU is the classic signature of a cryptominer. It coincides with exactly the component (the AVIF image optimizer) that has a public RCE. **Treat that CPU incident as a probable earlier sign of compromise, not as an encoding cost.**
3. **The repo itself is clean** (see "Malicious Code Found" below), so any malicious process lives **on the server** (for example in `/tmp`, crontab, systemd, `~/.ssh/authorized_keys`, a modified `.next/standalone`, or pm2 config). It does not live in git.

Secondary contributors make the app noisier than it should be and amplify load, but none of them can by themselves trigger a DigitalOcean block. They are listed under "Infinite Loop Files" and "Suspicious Network Calls".

> I could not confirm the compromise from the repository alone. Use the droplet checklist in item 2 of the Immediate Fix Checklist to verify it.

---

## Infinite Loop Files

**No true infinite loops were found.**

| Check | Result |
|---|---|
| `useEffect` / `useLayoutEffect` **without** a dependency array | **0** (AST scan of all `src/**/*.js(x)`) |
| `while(true)` / `for(;;)` | **0** |
| `setInterval` without `clearInterval` | **0**. All 5 are cleared: `reset-password/page.jsx:31`, `shop/offer/OfferCard.jsx:15`, `shop/offer/[slug]/CountdownTimer.jsx:25`, `Home/FlashSale/FlashSaleCountdown.jsx:31`, `ProductDetails/ViewersCount.jsx:11` (dead file) |
| Recursive `setTimeout` polling | **0**. The only `setTimeout(fn, …)` calls are one-shot: `AddAddressPopup.jsx:132`, `GTM.jsx:55`, `HomePageNews.jsx:59`, `news/NewsHomePage.jsx:29` |
| `location.reload` / `router.refresh` loops | **0**. Three one-shot `window.location.href` assignments: `checkout/page.jsx:849`, `dashboard/(orders)/all-orders/page.jsx:69`, `RouterStaleRecovery.jsx:46` |

**Request amplifiers** (not infinite, but they multiply calls, especially while the API is failing):

| File:line | Pattern | Effect |
|---|---|---|
| `src/Components/ReuseableComponent/ProductDetails/ProductDetails.jsx:133` (prop default) + `:147-155` (effect) | `policies = []` default param creates a **new array every render**, and the effect depends on `[policies, internalPolicies]` | When the page is rendered without `policies` and the `/policies` fetch fails or returns no `data`, the effect **re-fires `GET /policies` from the browser on every re-render** of the 937-line product component (variant clicks, scroll state, and so on). This is the closest thing to a runaway loop in the codebase, but it hits the **API**, from **visitors' browsers**. |
| `src/Components/ReuseableComponent/ProductDetails/ProductDetails.jsx:137-145` | `/settings` fetch until success, deps `[companySetting, internalSetting]` | Re-fires only when deps change. Low risk. |
| `src/Components/ReuseableComponent/ProductDetails/OrderReassurance.jsx:15-23` | `getSettings()` from the client until success | Low risk; guarded. |
| `src/Components/Navbar/NavFunction/SidebarFunction.jsx:19-33` | Client fallback fetch of `/categories` and `/brands` on each sidebar open while the server props are empty | Repeats on every open during an outage. |
| `src/Components/Navbar/NavAuthClient.jsx:43-53` | `getAuthUser()` on **every pathname change** | One BFF call → one API call per navigation, per logged-in user. |
| `src/Components/ReuseableComponent/SearchBar.jsx:67-100` | Live search, 400 ms debounce, about **420 KB response** per query | Bandwidth-heavy, but bounded. |
| `src/Components/ReuseableComponent/CustomUIComponent/RouterStaleRecovery.jsx:44-48` | Hard reload 2 s after a link click if the pathname has not changed | On slow responses or query-only navigations (`?page=2`), each click causes a **second full page load**, which doubles server renders. |
| `src/Components/ReuseableComponent/TekzoCare/TekzoCareCard.jsx:35`, `TekzoCarePopup.jsx:41` (and the used-device copies) | Effects that depend on callback props (`getAmountData`, `onCareSelect`, `onSelectCare`) | Re-run whenever the parent passes new function identities. They are guarded by value comparison, so there is no loop, but they cause extra renders. |

**Server side:**
- `src/proxy.js:66-72`: **one uncached `fetch` to `/customer/profile` per request**, but the matcher restricts it to `/dashboard/:path*` (plus redirect-only legacy paths). Prefetches of dashboard links also pass through it. This is moderate, not a burst source.
- `src/app/api/*`: no loops. `revalidate` only runs when the webhook is POSTed with the secret. `client-fetch` is a one-shot proxy.
- `next.config.mjs`: **no aggressive revalidation**. `minimumCacheTTL` is 31 days, and route `revalidate` values are 3600 or `false`. There is no regeneration loop.

---

## Suspicious Network Calls

**Outbound call inventory.** There are 33 `fetch(` call sites. There are **0** uses of `XMLHttpRequest`, `axios` (installed but never imported), `sendBeacon`, `WebSocket` or `EventSource`.

| Destination | Called from | Frequency |
|---|---|---|
| `NEXT_PUBLIC_API_URL` = `https://web-api.tekzo.com.bd/api/v1` | **Server:** `lib/api.js` (~55 fetchers, mostly cached forever and tagged), `utils/fetchAPI.js` (uncached), `proxy.js`, `api/client-fetch`, `api/logout`, sitemap routes. **Browser (direct):** `SearchBar.jsx:80`, `ProductComparisonHero.jsx:74,134`, `checkout/page.jsx:251,266,491`, `CartModal.jsx:67`, `EmiModalContent.jsx:29`, `RefurbishedProductGrid.jsx:36,57`, `OrderSuccessClient.jsx`, `all-orders/page.jsx:220`, `reset-password/page.jsx:50`, `WelcomePopup.jsx:45`, `SidebarFunction.jsx:22,28`, `ProductDetails.jsx:139,149` | Per page render or user action. The heaviest is a per-keystroke-debounce search. **Legitimate, your own API.** |
| `https://www.googletagmanager.com` | `Components/GTM/GTM.jsx:108,118` | Once per page load, deferred until `load`/idle or interaction (15 s safety timer). Legitimate. GTM then loads Facebook, TikTok and Clarity pixels **from the GTM container config, which is outside this repo**. Audit the GTM container for unknown tags. |
| `https://d2c2zgda4zwbg9.cloudfront.net`, `https://web-api.tekzo.com.bd`, `https://web-api.salamatinnovation.com` (**http and https**) | `next.config.mjs` `images.remotePatterns` → fetched **by the server's image optimizer** | Once per uncached image variant. This is the **attack surface of the AVIF/SVG RCE**. |
| `https://cdn-icons-png.flaticon.com` | one hard-coded image URL | Per render, browser side. |
| `wa.me`, `m.me`, `maps.google.com`, social links, `schema.org`, `sitemaps.org`, `w3.org` | `<a href>` links, XML namespaces | Not requests. Benign. |

**No calls to unknown, foreign or mining-pool domains exist anywhere in `src/` or `public/`.**

Other observations:
- `robots.js` disallows `/undefined/`. That shows that at some point a build ran with `NEXT_PUBLIC_API_URL` unset, and the browser requested `undefined/...` relative URLs **against your own server** (404 renders). The current `.env` is fully commented out, so **the next build will recreate that condition**. Every visitor's search, cart and checkout calls would then hit your own droplet.
- 135 `<Link>` tags do **not** set `prefetch={false}` (all dashboard pages, checkout, blog and others). In production, every visible link prefetches an RSC render. That is normal Next behavior, but it multiplies server renders per page view.
- `robots.js` does **not** disallow `/search`, and `/search` is `index: true` with `cache: "no-store"`. Crawlers can generate unlimited uncached renders plus API calls through `/search?query=…`.

---

## Malicious Code Found

**No, not in the repository.**

| Scan | Result |
|---|---|
| `coinhive`, `cryptonight`, `minero`, `webmine`, `coin-hive`, `crypto-loot`, `monero`, `xmrig`, `stratum+` in `src`, `public` and root configs | **0 hits** |
| `eval(`, `atob(`, `new Function(`, `\xNN` hex escapes, `String.fromCharCode`, `document.write(` (PCRE, `src` and `public`) | **0 hits** |
| Long base64 blobs (≥300 chars) in `src` JS/JSX | **0 hits** |
| Executable files in `public/` (`.js`, `.html`, `.wasm`, `.php`, `.sh`) | Only `public/google2280e7ae197433cf.html`, a standard Google Search Console verification token. Benign. |
| `<script>` / `<Script>` in `src` | Only GTM (`GTM.jsx`), JSON-LD (`CompanyJsonLd.jsx`, `ProductJsonLd.jsx`, `flash-sale/page.jsx`) and the checkout settings bootstrap (`checkout/layout.jsx`). No unknown domains. |
| `package.json` `preinstall`/`postinstall`/`prepare` hooks | **None**. The scripts are `dev`, `build`, `start`, `lint`, `tailwind:init`. |
| Dependencies with install scripts (lockfile `hasInstallScript`) | Only `sharp@0.34.5` and `unrs-resolver@1.11.1`, both legitimate native builds. |
| Lockfile package sources | 485 of 485 resolve from `registry.npmjs.org`. No git URLs, tarballs or mirrors. |
| Suspicious dependency `spacing@0.3.0` | Inspected: a CSS-only utility package (`main.css`, no JS, no install scripts). Harmless but unused. |

**This does not clear the server.** The deployed droplet can contain files that never touched git. See item 2 of the checklist below.

---

## Immediate Fix Checklist

Do these in order. None of them is application refactoring. They stop the traffic and close the hole.

- [ ] 1. **Do not bring the old droplet back online as-is.** If DigitalOcean lets you access it, use the Recovery Console only. Take a **snapshot for forensics** before changing anything.
- [ ] 2. **Run forensics on the droplet** (Recovery Console, read-only), looking for signs of compromise:
  - Processes and CPU: `ps auxf --sort=-%cpu | head -30` (look for `xmrig`, `kdevtmpfsi`, `kinsing`, random 6-8 character names, or anything running from `/tmp`, `/dev/shm` or `/var/tmp`).
  - Network: `ss -tunap` (outbound connections to pools on ports 3333, 4444, 5555, 7777, 14444, or floods to many IPs).
  - Persistence:
    - `crontab -l` for root and the app user, plus `ls -la /etc/cron*`;
    - `systemctl list-unit-files --state=enabled`;
    - `ls -la /tmp /dev/shm /var/tmp`;
    - `cat ~/.ssh/authorized_keys` (unknown keys);
    - `last -a`, `/var/log/auth.log`.
  - App tampering:
    - `pm2 list`, `pm2 show <app>` (extra processes or modified script paths);
    - `find <app>/.next <app>/node_modules -newer <app>/package.json -name "*.js" -mtime -30`;
    - pm2 and Next logs (`~/.pm2/logs`) for unusual `/_next/image?url=` requests (AVIF or SVG payloads) right before the CPU spike.
- [ ] 3. **Rebuild on a fresh droplet.** Never reuse a compromised one. Deploy from git, not from the old server's files.
- [ ] 4. **Upgrade before redeploying.** Change `next` from `16.1.4` to **≥ 16.4.6** (the `npm audit` fix version; check for anything newer at deploy time). Upgrade `react` and `react-dom` to the matching patched release, and make sure `sharp` resolves to **≥ 0.35.5**. Then run `npm audit --omit=dev` again and confirm there are **0 critical** issues.
- [ ] 5. **Shrink the image optimizer attack surface** until the upgrade is verified, using these `next.config.mjs` edits (configuration only):
  - remove `"image/avif"` from `images.formats` (keep WebP, or temporarily set `images.unoptimized: true`);
  - add `dangerouslyAllowSVG: false` (the default) and make sure SVGs are rendered with `unoptimized` or a plain `<img>`;
  - delete the `http://web-api.salamatinnovation.com` remote pattern and the duplicate CloudFront entry.
- [ ] 6. **Rotate every secret** that existed on the old droplet:
  - `REVALIDATION_SECRET`;
  - SSH keys;
  - DigitalOcean API tokens;
  - any backend DB, mail or payment gateway credentials if the Laravel API ran on the same droplet. Both domains returning 522 suggests it did; if so, the **backend must also be rebuilt and audited**.
- [ ] 7. **Restore `.env`** (uncomment `NEXT_PUBLIC_API_URL` and the rest) **before** building. Otherwise every browser calls `/undefined/...` on your own server (the `/undefined/` rule in `robots.js` shows this has happened before).
- [ ] 8. **Harden the new droplet:**
  - a DigitalOcean Cloud Firewall that allows inbound 80/443 **only from Cloudflare IP ranges**, plus SSH from your IP only;
  - an **egress policy** that blocks outbound traffic except 443 to your API, CloudFront and the npm registry;
  - run pm2 as a non-root user;
  - turn on Cloudflare rate limiting for `/_next/image*`, `/search*` and `/api/*`.
- [ ] 9. **Reduce self-inflicted load** (small code edits to schedule; not urgent for the block):
  - fix the `policies = []` default in `ProductDetails.jsx:133` (hoist a constant empty array, or drop the default);
  - add `Disallow: /search` to `robots.js` and set `/search` to `noindex`;
  - make `RouterStaleRecovery` compare `pathname + search`;
  - set `prefetch={false}` on dashboard and checkout `<Link>`s.
- [ ] 10. **Audit the GTM container** (`GTM-P2B3DNBX`) in Google Tag Manager for unknown Custom HTML tags. That is the only path by which third-party script could enter the site without being in this repo.
- [ ] 11. After redeploying, watch for 48 h: droplet CPU (should idle well below 30%; a sustained 90%+ means reinfection), outbound bandwidth graphs, and pm2 logs for `/_next/image` abuse.
