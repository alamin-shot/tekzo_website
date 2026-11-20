# Module: Configuration, Build, Assets & Repository Hygiene
**Path:** `next.config.mjs`, `package.json`, `package-lock.json`, `.env`, `.gitignore`, `eslint.config.mjs`, `jsconfig.json`, `postcss.config.mjs`, `tailwind.config.js`, `src/fonts/**`, `src/assets/lottie/**`, `public/**`, `.idea/`, `.kiro/`, `.claude/`, `.vscode/`, `search-iph.txt`, `README.md`

## 1. Critical Bugs & Security Risks
- **`.env` is fully commented out (CONFIRMED, 2026-11-19).** Every variable (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_GTM_ID`, `REVALIDATION_SECRET`, …) is prefixed with `#`. The existing `.next` build was produced while they were set. The **next** build or dev run will inline `undefined` into every client bundle (search, cart and checkout all request `undefined/...`). Server fetches will also hit `undefined/...`, and `REVALIDATION_SECRET` will be unset, so the revalidate webhook rejects every call (the route returns 401 when `!SECRET`). Add an env validation module (Zod over `process.env`) that fails the build on missing variables.
- **`REVALIDATION_SECRET` lives in `.env`.** It is correctly git-ignored via `.env*`, which is good. Make sure the production secret differs from any developer copy and is rotated if this `.env` was ever shared.
- **The CSP is report-only and reports nowhere.** `next.config.mjs` sets `Content-Security-Policy-Report-Only` **without `report-uri` or `report-to`**, so no violation data is collected, despite the comment's plan to "collect violation reports" before enforcing. The policy also allows `'unsafe-inline' 'unsafe-eval'` and `https://*.amazonaws.com` and `https://*.cloudflare.com` script sources (any S3 bucket, any Cloudflare-hosted script). Add a reporting endpoint, move inline scripts to nonces, then enforce.
- **`images.remotePatterns`:**
  - It allows **plain `http://web-api.salamatinnovation.com`**, which is mixed-content prone. Remove it.
  - CloudFront is listed twice.
  - **`salamat-innovation.s3.ap-south-1.amazonaws.com` is missing**, although the search API returns images from it (see `02`).
- **AVIF encoding CPU load.** The config comment admits AVIF via sharp caused 94-96% CPU on the pm2 server. `minimumCacheTTL` of 31 days helps. But the oversized intrinsic sizes used across the app (4000×3000 badges and logos) multiply the variants generated. Fix the component sizes (see `04`), and consider WebP-only, or a CDN image service (CloudFront plus Lambda or Cloudflare Images).
- **`.gitignore` is broken (CONFIRMED).** Lines 2-6 have a **leading space** (` .idea/`, ` .next/`, ` .vscod/`, ` .out/`, ` .kiro/`), so git treats the space as part of the pattern and they match nothing. As a result `.idea/*` (8 files) and `.kiro/PERSISTENT_SCROLLBAR_GUIDE.md` are **tracked**. `.vscod/` is also misspelled (it should be `.vscode/`). `.next/` and `/out/` are still covered by the later correct entries.
- **Committed junk:** `search-iph.txt` (425 KB raw API dump at the repo root), `ProductDetails.jsx.bak` (1,048 lines) and `UsedDevice/.../ProductDetails.jsx.bak` (521). `.claude/settings.json` is tracked, which is fine if intentional.
- **`package.json`:**
  - `"name": "Salamat Innovation"` is an invalid npm package name (spaces and capitals). It breaks some tooling (`npm pack`, some monorepo tools).
  - Unused or suspicious dependencies: `axios` (never imported), `spacing@0.3.0` (an obscure package; verify it is not a typo-squat and remove it if unused), `react-wavify` (verify usage), and `autoprefixer` (Tailwind v4 with `@tailwindcss/postcss` does not need it).
  - Duplicate concerns: `react-icons` and `lucide-react` (two icon libraries), and `framer-motion` and `lottie-react` (two animation libraries).
  - **Missing** dependencies the master rules require: `typescript`, `@types/*`, `@reduxjs/toolkit`, `react-redux`, `zod`, `server-only`. There is also no test runner (Vitest/Jest/Playwright) and no `typecheck` or `test` script.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:** env vars are all `NEXT_PUBLIC_*`, including the API base URL, which leaks the backend origin into the client and encourages direct browser→API calls. Introduce a server-only `API_URL` used by the server HTTP core, and keep only `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_GTM_ID` public.
- **State Management:** not applicable.
- **File Size:** `next.config.mjs` (110 lines; it is OK, but extract the headers/CSP builder into `config/securityHeaders.mjs`). `globals.css` (506) and `styles/theme.css` (334): split into layers (`base`, `components`, `utilities`) or Tailwind `@theme` tokens. `src/hooks/README.md` (189) and `.kiro/*.md` are docs living in source folders; move them to `docs/`.
- **TypeScript:** there is no `tsconfig.json`, only `jsconfig.json` with `@/*`. Migrate incrementally: add a `tsconfig.json` with `allowJs: true`, `strict: true` and `checkJs: false`, convert `lib/`, `utils/` and `store/` first, then components as they are refactored.
- **Linting:** `eslint.config.mjs` (14 lines) is minimal. Add `next/core-web-vitals`, `react/no-danger` (with a sanitizer allow-list), `max-lines: 100`, `no-restricted-imports` (forbid `@/lib/api` and `@/utils/fetchAPI` from client files), and `import/no-unused-modules` to catch the 40+ dead files.

## 3. Duplication & Technical Debt
- **Fonts:** `src/fonts/Switzer/Fonts/WEB/fonts/` contains 20 woff2 weights, including both `Variable` and `VariableItalic`. If `lib/fonts.js` uses the variable font, the 18 static weights are dead weight in the repo (and in the bundle if referenced). Bornomala ships as raw TTF; convert it to woff2.
- **Lottie assets:** `not-found.json` (646 KB), `login-animation.json` (210 KB), `gift.json` (121 KB), `shopping-man.json` (61 KB) and `view.json` (18 KB). Check whether `shopping-man`, `view` and `gift` are referenced at all (the grep found imports only for `water-wave`, `robot-assistant`, `login-animation` and `not-found`).
- `public/` likely holds both `official-logoo.webp` and older logo variants (the misspelled filenames `official-logoo`, `unofficial-iconn` suggest re-uploads). Audit and remove unused assets.
- `README.md` (1.5 KB) is the default create-next-app README: there is no onboarding, env or deploy documentation.
- **About 40 unused component and module files** (see the list in `00-index.md`).

## 4. Data Fetching & Performance
- `output: "standalone"` with pm2. Good for a self-hosted Node server. Make sure `.next/static` and `public` are copied next to `server.js` on deploy, or assets will 404.
- If pm2 runs in **cluster mode**, the Next data cache (`.next/cache/fetch-cache`) is **per process**. `revalidateTag` from the webhook then only purges the cache of the instance that received it, and other instances serve stale prices. Use a shared cache handler (Redis, `cacheHandler` in `next.config`) or run a single instance.
- Server Actions plus multiple instances also need a stable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` across instances and deploys, or actions fail with "Failed to find Server Action" (relevant to the search modal; see `02` §1.2).
- `logging.fetches.fullUrl: true` in production (see `13`).
- `devIndicators` config is harmless.

## 5. Actionable Refactor Checklist
- [ ] 1. Restore `.env` immediately. Add `src/env.ts` (Zod over `process.env`) imported by `next.config`, so builds fail on missing variables. Add `.env.example`.
- [ ] 2. Introduce a server-only `API_URL`, and stop exposing the backend base URL as `NEXT_PUBLIC_*` once the BFF exists.
- [ ] 3. Fix `.gitignore` (remove the leading spaces, fix `.vscode/`), then `git rm -r --cached .idea .kiro` (keep `.kiro` docs by moving them to `docs/` if wanted).
- [ ] 4. Delete `search-iph.txt` (or move it to test fixtures) and both `.bak` files.
- [ ] 5. CSP: add `report-to`/`report-uri`, replace `unsafe-inline`/`unsafe-eval` with nonces (Next supports nonce via `proxy.js`), narrow the `*.amazonaws.com` and `*.cloudflare.com` wildcards, then switch to enforcing.
- [ ] 6. `images.remotePatterns`: remove the plain-`http` entry and the duplicate CloudFront entry, and add the S3 bucket (or normalize URLs). Fix oversized intrinsic image sizes app-wide.
- [ ] 7. `package.json`: rename to `salamat-innovation-frontend`. Remove `spacing`, `autoprefixer` and (after verification) `react-wavify` and the unused icon or animation libraries. Add `typescript`, `zod`, `@reduxjs/toolkit`, `react-redux`, `server-only`, `vitest`, `@playwright/test`, and `typecheck` and `test` scripts.
- [ ] 8. Add `tsconfig.json` (`allowJs`, `strict`) and a migration plan: `lib` → `store` → `components`.
- [ ] 9. Strengthen ESLint (`max-lines: 100`, `react/no-danger`, restricted imports, unused-module detection) and add it to CI.
- [ ] 10. pm2: confirm the cluster mode. If it is clustered, add a shared `cacheHandler` and a fixed `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`.
- [ ] 11. Trim the fonts (variable woff2 only, Bornomala → woff2) and remove unused Lottie and `public/` assets.
- [ ] 12. Rewrite `README.md` with setup, env, architecture (BFF, Redux, caching) and deploy steps.
