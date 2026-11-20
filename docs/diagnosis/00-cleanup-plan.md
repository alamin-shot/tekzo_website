# Module: Security Cleanup, Upgrade & Execution Protocol
**Path:** `package.json`, `package-lock.json`, `next.config.mjs`, `.env`, `node_modules/`, `.next/`, plus the files listed per step

> Status: **PLAN ONLY. Nothing has been executed in the project.** Every command below is for Phase 3, after approval.
> Evidence base: `00-architecture-map.md`, `99-traffic-spike.md`, `99-deep-forensic-audit.md`, and a **sandbox dry-run** (a clean `git archive HEAD` copy in a temp folder, never the project) that installed the target versions, compiled, linted and audited (§4).

---

## 1. Package Upgrades

### 1.1 Target versions (verified against the npm registry, 2026-11-19)

| Package | Current | Target | Why |
|---|---|---|---|
| `next` | 16.1.4 | **16.4.6** (current `latest` dist-tag) | Fixes all 4 critical RCEs (AVIF, SVG, `use cache`, Windows), SSRF, proxy bypass and DoS advisories |
| `eslint-config-next` | ^16.1.4 | **16.4.6** | Must match `next` |
| `react`, `react-dom` | 19.2.3 | **19.2.3 (unchanged, as requested)** | `next@16.4.6` peer range is `^18.2.0 \|\| ^19.0.0`, so 19.2.3 is compatible. `npm audit` lists **no** advisories for react or react-dom 19.2.3. |
| `sharp` (transitive) | 0.34.5 | **0.35.5** (pulled in automatically by next 16.4.6, verified in the sandbox) | Fixes the libvips, libheif and librsvg HIGH advisories behind the image optimizer |
| Node.js (server) | — | **≥ 20.9** (`next` engines). Use **Node 22 LTS or 24 LTS** on the droplet. | Node 26 (this PC) works but prints `DEP0205` warnings |

### 1.2 Exact commands

```bash
# pin exactly (recommended for a security baseline: no silent drift to a future minor)
npm install --save-exact next@16.4.6 eslint-config-next@16.4.6 react@19.2.3 react-dom@19.2.3

# OR, if you prefer the caret range you specified:
npm install next@^16.4.6 eslint-config-next@^16.4.6 react@19.2.3 react-dom@19.2.3 --save-exact=false
#   (react/react-dom stay exact because package.json already pins them without ^)

# then clear the transitive HIGHs that remain after the bump (undici, form-data, source-map-js, follow-redirects, dompurify)
npm audit fix            # NOT --force: --force would "fix" @tailwindcss/typography by DOWNGRADING it to 0.5.4
npm audit --omit=dev     # expect: 0 critical; remaining items listed in §4.3
```

> Note for this PC: the installed npm blocks unapproved install scripts (`allowScripts`). The sandbox install reported `unrs-resolver@1.11.1 (postinstall)` as blocked. It is a legitimate dev-only ESLint resolver binary (audited in `99-deep-forensic-audit.md`). Approve it explicitly with `npm install-scripts approve unrs-resolver`, or leave it blocked (lint import-resolution falls back to JS).

---

## 2. Removing the AVIF RCE

The **upgrade is the actual fix**. The config change below is defense in depth, and protects you if a future image-codec CVE appears.

### 2.1 Steps (`next.config.mjs`)

1. In `images.formats`, change `["image/avif", "image/webp"]` → **`["image/webp"]`** (or delete the `formats` key entirely; the Next default is `["image/webp"]`).
2. Also in `images`:
   - delete the **`http://web-api.salamatinnovation.com`** remote pattern (plain HTTP);
   - delete the **duplicate** CloudFront entry;
   - **add** `https://salamat-innovation.s3.ap-south-1.amazonaws.com` (search results return images from it; see `02-search-bug.md`).
3. Add `dangerouslyAllowSVG: false` explicitly. This is already the default; stating it documents intent and blocks accidental enabling.
4. Optional: add `qualities: [75, 90]`. One component requests `quality={90}`, and Next 16 only honors qualities listed here (default `[75]`). It is already silently coerced today, so this is not a regression.
5. Update the code comment above `formats`. The "94-96% CPU from AVIF" note should now read as a **suspected compromise indicator** (see `99-traffic-spike.md`).
6. Delete the optimizer cache after deploy: **`.next/cache/images/`** (it holds AVIF variants encoded by the vulnerable build).
7. Re-encode the two **AVIF files disguised as JPEG** to real JPEG or WebP, or rename them `.avif`: `public/blog.jpeg` and `public/flashsale/flashsale-cover.jpg`. Removing AVIF from `formats` only stops AVIF **output**; sharp still **decodes AVIF inputs**, and these two files are fed to the optimizer on `/blog/*`, `/flash-sale` and the blog cards.

### 2.2 Fallback behavior after the change

- `/_next/image` negotiates the output format from the browser's `Accept` header **among the configured formats only**. Browsers that accept WebP (every current Chrome, Safari 14+, Firefox, Edge) get **WebP**. Anything else gets the **source format** (JPEG or PNG).
- **No component changes are needed.** All 122 `next/image` call sites keep working unchanged.
- Expected impact: images about 10-25% larger than AVIF in bytes, and **much lower CPU** per encode (WebP encodes several times faster than AVIF in sharp). `minimumCacheTTL` (31 days) stays.
- SVGs: with `dangerouslyAllowSVG: false`, the default loader **does not** pass `.svg` sources through sharp (they are served as-is). `/Chinese.svg`, `/payment-logo/*.svg` and the others continue to render.

---

## 3. Dependency Pruning

| Package | Used in `src/`? | Verdict | Action |
|---|---|---|---|
| `axios` ^1.13.2 | **0 imports** | Unused, and carries ~30 advisories (HIGH) | `npm uninstall axios`. Re-add the **latest** version later only when the Axios BFF layer is built (master rule). This also drops the transitive `form-data` HIGH. |
| `spacing` ^0.3.0 | **0 imports** (a CSS-only package, never `@import`ed) | Unused | `npm uninstall spacing` |
| `react-wavify` ^1.11.1 | **0 imports** | Unused | `npm uninstall react-wavify` |
| `autoprefixer` ^10.4.23 (dev) | Not referenced in `postcss.config.mjs` (only `@tailwindcss/postcss`, which bundles Lightning CSS prefixing) | Redundant | `npm uninstall -D autoprefixer` |
| `@tailwindcss/typography` ^0.5.19 | Declared only in `tailwind.config.js`, **which Tailwind v4 never loads**: `globals.css` uses `@import "tailwindcss"` with no `@config` or `@plugin`. Yet **8 components use `prose` classes**, which currently render unstyled. | **Keep, but it is effectively dead today** | Decision needed (§5, Phase 3b): either add `@plugin "@tailwindcss/typography";` to `globals.css` (this **changes** blog and policy styling, so QA it) or remove the package and the `prose` classes. Do **not** run `npm audit fix --force` (it downgrades this package). |
| `tailwind.config.js` | Not loaded by Tailwind v4 (see above) | Dead config | Migrate its `theme` values to `@theme` in CSS, or add `@config "../../tailwind.config.js";`. Check for missing custom colors or fonts before deleting it. |
| `lottie-react` ^2.4.1 | 3 files (footer, login, 404), lazy-loaded | Heavy (~240 KB runtime) | Keep for now. Replacing it is a later performance item. |
| `framer-motion` ^12.34.2 | 16 files | Used | Keep. A minor bump is optional. |
| `lucide-react` (90 files) **and** `react-icons` (70 files) | Both used | Redundant pair | Keep both for now. Consolidating is a refactor, not part of the security cleanup. |
| `swiper` ^12.2.0 | 27 files | Used | Keep at 12.x. 14.x is a major upgrade; out of scope. |
| `isomorphic-dompurify` ^3.8.0 | `lib/formatHtml.js` | Used; bundled `dompurify` has sanitizer-bypass advisories | `npm install isomorphic-dompurify@^3.19.0` (same major, picks up the patched `dompurify`) |
| `eslint` ^9.39.2 | dev | OK | Stay on 9.x (10.x is a major upgrade) |
| `tailwindcss` / `@tailwindcss/postcss` 4.1.18 | build | Minor behind (4.3.5) | Optional, in a **separate** commit after the Next upgrade is verified |

Also rename `package.json` `"name": "Salamat Innovation"` to `"salamat-innovation-frontend"` (spaces and capitals are invalid npm names).

---

## 4. Mismatch Alignments: what breaks on 16.1.4 → 16.4.6

### 4.1 Sandbox upgrade results (empirical)

A clean copy of `HEAD` was installed with `next@16.4.6`, `eslint-config-next@16.4.6` and `react`/`react-dom@19.2.3`.

| Check | Result |
|---|---|
| `npm install` | ✅ Succeeded. Resolved: next 16.4.6, react 19.2.3, react-dom 19.2.3, **sharp 0.35.5**, eslint-config-next 16.4.6. |
| `next build --experimental-build-mode=compile` (Turbopack) | ✅ **Compiled successfully** (9.8 s). **All routes and the Proxy compiled with zero errors.** No import, API or config breakage. |
| `next build` generate/prerender phase | ⚠️ **Not testable now.** The API is down (Cloudflare 522; re-checked during this audit). It must be run once the backend is reachable (Phase 3, step 3.9). |
| ESLint (`eslint src`) | No new rules fire. The newer `react-hooks` plugin flags **more** `set-state-in-effect` cases (24 → 50) and `static-components` (5 → 7). Totals are 95 errors on 16.4.6 vs 66 on 16.1.4. **Next 16's `next build` does not run lint, so nothing blocks the build.** |
| `npm audit --omit=dev` | **Critical 1 → 0.** High 7 → 4 (axios, form-data, undici, source-map-js) and moderate 5 → 4 (@tailwindcss/typography, dompurify, follow-redirects, postcss-selector-parser). Of these, axios (and with it form-data) is removed by §3, and `npm audit fix` resolves undici, source-map-js, dompurify and follow-redirects. |

### 4.2 Per-area compatibility review (static plus sandbox)

| Area | Will it break? | Notes and alignment needed |
|---|---|---|
| `src/utils/fetchAPI.js` (`"use server"`, `cookies()`) | **No.** It compiles, and `await cookies()` is already the Next 16 API. | Behavior change to verify: 16.4.x fixed "Unauthenticated disclosure of internal Server Function endpoints" and the Server Actions DoS and SSRF issues. The **accidental** actions (search modal `library/*`, `Shop/Filter.jsx`) still work, but they remain an attack surface. **Alignment (after the upgrade, as a separate PR):** replace `"use server"` with `import "server-only"` and feed those two client components through props or BFF routes. Do **not** change this in the same commit as the version bump. |
| `src/proxy.js` | **No** (compiles as "Proxy (Middleware)") | 16.2.x–16.4.x patched several proxy-bypass vectors (segment-prefetch routes, dynamic-param injection), so **more** requests may now correctly pass through the proxy (for example dashboard prefetches). That means more `/customer/profile` calls. Verify in QA that the dashboard still loads and that **logged-out access to `/dashboard/*` redirects to `/login`**. |
| Server Actions (`Login/actions.js` with `useActionState`, `Contact/actions.js`) | **Possibly at runtime** behind Cloudflare | 16.1.7+ tightened the Server Actions CSRF check (`null` origin). If the reverse proxy (Cloudflare, nginx) rewrites `Host` or strips `Origin`, actions can fail with "Invalid Server Actions request". **Alignment:** ensure nginx forwards `Host` and `X-Forwarded-Host`, or set `experimental.serverActions.allowedOrigins: ["www.tekzo.com.bd","tekzo.com.bd"]`. QA login and contact first. |
| `revalidateTag(tag, "max")` ×39, `revalidatePath` | No | Already the Next 16 signature |
| `params`, `searchParams`, `cookies()`, `headers()` | No | Already awaited everywhere |
| `next/image` (122 files) | No | `priority` may log deprecation warnings (→ `preload`), cosmetically. `quality={90}` is coerced to 75 unless `qualities` is set (unchanged behavior). |
| `next/og` (`categories/[slug]/opengraph-image.jsx`) | No (compiled) | Verify one OG image renders after a full build |
| `next/font/local` (`lib/fonts.js`) | No (compiled) | — |
| `next/script` `beforeInteractive` in `GTM.jsx` | No | 16.2.5 patched XSS in `beforeInteractive` scripts with untrusted input. The GTM ID is from env, so it is safe. A lint warning about placement outside the document is pre-existing. |
| `package.json` `"dev": "next dev --turbo"` | No | `--turbo` is redundant (Turbopack is the default). Change it to `next dev` to silence warnings. |
| `.next/standalone` deploy layout | No | Same `output: "standalone"`. Copy `public/` and `.next/static` next to `server.js` as before. |
| Pre-existing real bugs surfaced by lint (not caused by the upgrade) | — | `Components/UsedDevice/UsedDeviceClient.jsx:195`: a duplicate JSX prop. `Components/news/NewsHomePage.jsx:27`: conditional `useEffect` (a dead file, so delete it). |

### 4.3 Alignments to do **before** the version bump (in order)

1. Commit the `docs/` folder on its own (it is currently untracked).
2. Run `npm uninstall axios spacing react-wavify` and `npm uninstall -D autoprefixer` as **one commit**. Verify `npm run build` still compiles on 16.1.4 (zero imports, so it should).
3. Change the `dev` script to `next dev`.
4. Decide on the Server Actions origin config (§4.2) so login works behind Cloudflare on day one.
5. **Then** do the version bump (§1.2) as its own commit, then the `next.config.mjs` image changes (§2) as their own commit. Each commit can be reverted independently.

---

## 5. Execution & Caution Protocol (Phase 3)

### 5.1 Backup strategy

```bash
git status                                    # must be clean except docs/
git add docs && git commit -m "docs: diagnosis and security audit"   # (optional, keeps the docs in history)
git tag -a pre-security-upgrade-2026-11-19 -m "Snapshot before Next 16.4.6 security upgrade"
git push origin pre-security-upgrade-2026-11-19          # remote copy of the exact pre-change state
git bundle create ../tekzo-frontend-backup-2026-11-19.bundle --all   # offline, self-contained backup of every branch and tag
git switch -c security/next-16.4.6-upgrade               # all work happens here; main stays untouched
```

- Keep **one logical change per commit**: (1) prune deps, (2) bump Next, (3) image config, (4) asset re-encode, (5) `.gitignore` and `.claude` cleanup. Each is independently revertible.
- Merge to `main` via a PR only after the §5.3 QA passes. Never force-push `main`.
- **Never commit `.env`.** Never commit `.next/`.

### 5.2 Nuke & Pave

**Local (this PC):**

| Item | Action | Why |
|---|---|---|
| `node_modules/` | **Delete** (`rm -rf node_modules`), then reinstall | Holds the vulnerable versions and Windows-native binaries. Reinstall from the updated lockfile. |
| `.next/` (all of it: `cache/`, `standalone/`, `server/`, `static/`) | **Delete** | `standalone/.env` contains the **live `REVALIDATION_SECRET`**. `cache/images` holds AVIF variants from the vulnerable build. Everything is regenerable. |
| `package-lock.json` | **Update in place, do not hand-delete.** The `npm install …@16.4.6` and `npm audit fix` steps rewrite it. | The forensic audit verified it is clean: 485/485 entries from `registry.npmjs.org` with sha512 integrity, and no hijacked versions. Deleting it would float **every** transitive dependency to new versions at once, which risks breakage without any security benefit. *(If you insist on full regeneration: delete it **after** the bump and run `npm install` once, then re-run `npm audit` and the full QA.)* |
| `.env` | **Recreate** from a new `.env.example` with **new** secret values (§5.4). Uncomment the variables. | The current values are exposed: they were copied to the droplet via `standalone/.env`. |
| `search-iph.txt`, `*.jsx.bak` | Delete (`git rm`) | Junk; not security-relevant |
| `.claude/settings.json` | `git rm --cached`, and remove the `python3 -c *`, `node -e *` and `npx next *` wildcards | Pre-authorized arbitrary code execution for AI agents |
| `.gitignore` | Fix the leading spaces (` .idea/` → `.idea/`, and so on) and `.vscod/` → `.vscode/`. Add `.claude/`. Then `git rm -r --cached .idea .kiro`. | Stops tracking IDE and agent folders |

**Server (new droplet; never the old one):**
- Provision a **fresh** droplet from a clean OS image. Do **not** restore from a snapshot of the compromised droplet.
- Get the code with `git clone` at the reviewed commit. **Do not** `scp` the local `node_modules/`, `.next/` or `.env`.
- Run `npm ci` (which installs exactly the lockfile), then `npm run build` **on the server or in CI**.
- Create `.env` on the server **by hand** with the rotated values, with permissions `chmod 600`, owned by the app user.
- Run pm2 as a **non-root** user. Use the Cloud Firewall: inbound 80/443 from Cloudflare IP ranges only, SSH from your IP only, and an outbound egress allow-list.
- If the Laravel API ran on the same droplet (both domains returned 522, which suggests it did), **the backend gets the same nuke-and-pave plus its own audit**.

### 5.3 Testing strategy

**A. Automated gates (each must pass before QA):**
1. `npm ci` completes with no errors. Approve only the `sharp` and `unrs-resolver` install scripts.
2. `npm audit --omit=dev` shows **0 critical**, and no HIGH in `next` or `sharp`.
3. `npm run build` (the **full** build, not compile-only, with the API reachable) exits 0. Note any prerender errors per route.
4. `npm run start`, then `curl -I` on `/`, `/shop`, `/product/<known-slug>`, `/sitemap.xml` and `/robots.txt` all return 200.
5. Image check: `curl -sI -H "Accept: image/avif,image/webp,*/*" "http://localhost:3000/_next/image?url=%2Fblog.jpeg&w=640&q=75"` returns `content-type: image/webp` (**not** avif).
6. Server Actions check: submit the login form and confirm no "Invalid Server Actions request" in the server log.

**B. Manual QA checklist** (desktop Chrome, iPhone Safari, Android Chrome; logged-out **and** logged-in):

- [ ] **Home:** hero slider and video, categories, flash sale countdown, brands, featured, new arrival, reels and live section, used devices, FAQ. No console errors.
- [ ] **Navigation:** navbar (desktop hover menus, mobile sidebar), footer links, WhatsApp button, welcome popup appears once.
- [ ] **Search:** focus the search bar → modal opens with featured products. Type "iphone" → results appear (see `02-search-bug.md` for the known pre-existing issues: placeholder images and missing prices). "View All" → `/search?query=iphone`. Voice search on Chrome.
- [ ] **Shop and listings:** `/shop` filters (price, brand, stock, sort) and pagination. `/categories/<slug>`, `/brands/<slug>`, `/tags/<slug>`, `/flash-sale`, `/new-arrival-products`, `/shop/offer` and an offer detail page.
- [ ] **Product page:** gallery, variant and color switch, Tekzo Care add-on, gift selector, EMI modal (banks load), share, reviews, related products, sticky bottom bar on mobile, **Add to Compare** → `/compare` shows it.
- [ ] **Images:** product images, badges (official, unofficial, Chinese, refurbished SVG/WebP), payment SVG logos, blog cover (`/blog.jpeg`), flash-sale cover. All visible, and served as WebP.
- [ ] **Cart (guest):** add to cart from a card and from the product page, and the cart badge increments. Open the checkout, then change quantity and remove.
- [ ] **Checkout (guest):** districts and areas load, phone OTP send and verify, coupon (**known pre-existing bug:** guest coupon returns 401), COD order → `/order/successful?invoice_number=…`, invoice download.
- [ ] **Checkout (online and bKash):** redirect to the payment gateway, then back to the success, failed or cancelled pages.
- [ ] **Login and register:** email and password login (Server Action), `?redirect=/dashboard/...` honored, register, logout, reset-password OTP flow.
- [ ] **Auth gate:** logged-out → `/dashboard/manage-account` redirects to `/login`. Logged-in → `/login` redirects to the dashboard.
- [ ] **Dashboard:** profile view and edit (avatar upload), address book (add, edit, default billing and shipping), all orders plus the status tabs, order detail, pay due, invoice PDF, my bag, wishlist (add, remove, move to cart), coupons, reviews (to-review and history), sell-device requests, elite status, theme toggle.
- [ ] **Order tracking (guest):** `/order-tracking` (**known pre-existing bug:** guests get 401).
- [ ] **Used, pre-owned and refurbished:** `/marketplace`, `/used-device`, a used product detail page, `/refurbished`, the sell-your-device wizard with photo upload.
- [ ] **Content:** about-us tabs, blog list and detail, news, careers plus an apply form with CV upload, FAQ, policy pages, outlets list and detail (map), contact form submit, partners forms, warranty claim, tekzo-care, discovery.
- [ ] **SEO and infra:** `/sitemap.xml` plus the child sitemaps, `/robots.txt`, `/llms.txt`, OG image for a category, JSON-LD present on product pages, legacy redirects (`/all-products` → `/shop` returns 301).
- [ ] **Revalidation webhook:** `POST /api/revalidate` with the **new** secret and `{type:"product", slug}` → 200, and the change appears. With the **old** secret → 401.
- [ ] **Load sanity (48 h after deploy):** droplet CPU idles below 30%, and outbound bandwidth is flat. Grep `/_next/image` in the pm2 logs for abuse.

Record pass/fail per item in the PR description, and compare against the same checklist run on the current production behavior where possible (the known pre-existing bugs are listed above so they are not mistaken for regressions).

### 5.4 Secret rotation (must happen **before** the new server goes live)

| Secret / credential | Where it was exposed | Action |
|---|---|---|
| **`REVALIDATION_SECRET`** (64 chars) | `.env` → copied into `.next/standalone/.env` → on the droplet | **Rotate now.** Generate a new 64-character random value (`openssl rand -hex 32`). Update it in the **backend's webhook config** and in the new server's `.env`. Also confirm that the **old 24-character value from git commit `d70edce`** is rejected. |
| **Customer bearer tokens** (`auth_token` cookies; backend personal access tokens) | Every logged-in request passed tokens through the compromised Next server (`proxy.js`, `fetchAPI`, `/api/client-fetch`). An attacker with RCE could harvest them from memory or logs. | **Revoke all customer tokens on the backend** (for example truncate the Sanctum `personal_access_tokens` table), forcing everyone to log in again. Consider forcing password resets if logs show the compromise window was long. |
| SSH keys, DigitalOcean API tokens, GitHub deploy keys or PATs, pm2 keys | Present on the droplet | Revoke and reissue. Remove the old keys from GitHub and DigitalOcean. |
| Cloudflare API tokens and **Origin CA certificate private key** (if installed on the droplet) | Droplet filesystem | Revoke and reissue in the Cloudflare dashboard |
| Backend secrets, **if the API shared the droplet**: Laravel `APP_KEY`, DB credentials, mail SMTP, SMS/OTP gateway, **payment gateway** (SSLCommerz, bKash) keys, S3/CloudFront IAM keys | Droplet filesystem | Rotate all of them, and notify the payment gateways if keys may have leaked |
| `NEXT_PUBLIC_GTM_ID` | Public by design (it is in every page's HTML) | No rotation needed. **Do** review GTM container users and tags for anything unknown. |
| `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_URL`, `NODE_ENV` | Public, not secrets | No rotation needed |

---

## 6. Phase 3 execution order (for approval)

1. **3.1** Backup (§5.1): tag, bundle, branch.
2. **3.2** Repo hygiene: `.gitignore` fix, untrack `.idea`, `.kiro` and `.claude`, delete `search-iph.txt` and the `.bak` files.
3. **3.3** Prune dependencies (§3) and change the `dev` script, then compile check.
4. **3.4** Bump `next` and `eslint-config-next` to 16.4.6 (React stays 19.2.3) and run `npm audit fix` (§1.2).
5. **3.5** `next.config.mjs` image hardening (§2.1) and the Server Actions origin config (§4.2).
6. **3.6** Re-encode the two AVIF-as-JPEG assets.
7. **3.7** Nuke local `node_modules/` and `.next/`, then `npm ci`.
8. **3.8** Recreate `.env` with rotated secrets (§5.4).
9. **3.9** Full `npm run build` plus the automated gates (§5.3 A), once the API is reachable.
10. **3.10** Manual QA (§5.3 B), then PR to `main`.
11. **3.11** Fresh droplet deploy (§5.2 server) and 48-hour monitoring.

Explicitly **out of scope** for this security pass (tracked in the other diagnosis docs): the search fixes, the BFF lockdown, the Redux migration, the TypeScript migration, file splitting, and the pre-existing bugs (guest coupon 401, guest order-tracking 401, proxy cookie deletion, the login open redirect). The last two are security-relevant, so I recommend doing them **immediately after** this pass, as their own PR.
