# 10 — GEO (Generative Engine Optimization) fixes

Source: AITDK GEO report for www.tekzo.com.bd (score 85 / B, 2026-11-21).
Scope: invisible metadata only — JSON-LD, `metadata` exports, `robots.js`,
`llms.txt`, SEO utility files. No design, class, layout or business-logic changes.

Status legend: ✅ done & verified · ⚠️ done in code, needs action outside code · ⏸ deferred

## Checklist

| # | Item | Status |
|---|------|--------|
| 1 | AI crawler access (`robots.js`) | ⚠️ code done; **Cloudflare still blocks** |
| 2 | Organization `sameAs` links | ✅ |
| 3 | `llms.txt` | ✅ (already existed) |
| 4 | Global `WebSite` + `SearchAction` schema | ✅ (already existed) |
| 5a | `ProductJsonLd` `product` fallback | ✅ fixed 2 crash/validity bugs |
| 5b | Blog `Article` schema | ✅ fixed date/image validity |
| — | Copywriting items (question headings, citations, content depth) | ⏸ content team |

## 1. AI crawler access

- `src/app/robots.js`: the `GPTBot / ChatGPT-User / CCBot / Google-Extended`
  `Disallow: /` block is removed (uncommitted change already in the tree).
  Verified locally: `/robots.txt` now has only the `*` rules + sitemap.
- **Not sufficient on its own.** The live `robots.txt` is prefixed by a
  *Cloudflare Managed* block that disallows ~30 AI user agents (GPTBot,
  ClaudeBot, Google-Extended, CCBot, meta-externalagent, Amazonbot,
  Applebot-Extended, Bytespider, …) and sets
  `Content-Signal: search=yes,ai-train=no,use=reference`. Cloudflare's bot
  rules also return **HTTP 403** to `GPTBot` and `ClaudeBot` user agents
  (checked 2026-11-21; `ChatGPT-User` gets 200).
- Action required (Cloudflare dashboard → AI Crawl Control / Bots, and
  "Manage robots.txt"): decide per crawler. Recommended: allow AI *search /
  assistant* fetchers (OAI-SearchBot, ChatGPT-User, PerplexityBot,
  Claude-SearchBot/Claude-User) and keep training crawlers blocked if desired.
  Caution: see `99-traffic-spike.md` — re-opening everything to all bots may
  bring back crawl load on the origin.

## 2. Organization schema `sameAs`

- File: `src/Components/SEO/CompanyJsonLd.jsx` (rendered by `src/app/(main)/layout.jsx`).
- Before: `sameAs: seo?.socialLink ?? []` → empty on the live site.
- Now: `getSocialProfiles(companySetting, seo?.socialLink)` from
  `src/lib/seo/jsonLd.js` — uses the same `facebook_link`, `instagram_link`,
  `tiktok_link`, `youtube_link`, `linkedin_link` settings the footer already
  shows, keeps only real `http(s)` URLs (the footer's `"/"` placeholders are
  dropped), de-duplicates, and falls back to `DEFAULT_SOCIAL_PROFILES`.
- The fallback list uses the TEKZO URLs found in the untracked
  `src/Components/shared/schema/OrganizationSchema.jsx` instead of invented
  placeholders (a wrong `sameAs` would tie the brand to someone else's page).
  **Confirm or replace them** in `src/lib/seo/jsonLd.js`.
- Verified locally: Organization node renders with 5 `sameAs` entries.

## 3. `llms.txt`

- `src/app/llms.txt/route.js` already exists (committed) and is live:
  `https://www.tekzo.com.bd/llms.txt` returns 200 `text/plain`. Uses
  `NEXT_PUBLIC_URL` with a `https://www.tekzo.com.bd` fallback. Lists Home,
  Shop, Brands, Categories, Flash Sale, Used Devices, Blog, FAQ, About, Contact,
  Outlets, Privacy and Terms policies, plus sitemaps. All linked route folders
  exist. No change made.
- Note: `NEXT_PUBLIC_URL` is not set in `.env.local`; the fallback is correct
  for production.

## 4. `WebSite` schema

- Already in `CompanyJsonLd` `@graph`: `url`, `name`, `inLanguage`, and
  `SearchAction` → `/search?query={search_term_string}`. `/search` reads the
  `query` param, so the template is correct. Verified in rendered HTML.

## 5a. `ProductJsonLd` (`product` fallback)

Wiring is correct (`<ProductJsonLd seo={seo} product={data} />`). Fixed:
- `image.startsWith(...)` threw if any image field was not a string, which
  would crash the product page render. Now resolved via `absoluteUrl()`
  (non-strings skipped).
- `url` became `/product/undefined` when both `seo.canonical` and slug were
  missing; now omitted instead.
- Output escaped with `serializeJsonLd()` (see Security below).
Remaining (not changed): availability falls back to the raw `stock` column,
which is unreliable; only used when `seo.availability` is absent.

## 5b. Blog `Article` schema

`src/app/(main)/blog/[slug]/page.jsx` — exists. Fixed:
- `datePublished` / `dateModified` were the API's *display* strings (see
  `BlogContent.jsx` comment) — invalid for schema.org. Now ISO 8601 via
  `toIsoDate()`; unparseable values are omitted rather than emitted invalid.
  This also addresses AITDK "Freshness Signals" / "Author & Date Markup".
- `image` made absolute (was `/blog.jpeg` relative).
- Added `url` and `mainEntityOfPage` (canonical).
- Publisher logo uses `SITE_URL` instead of a hard-coded host.

## Security

Every JSON-LD block used `JSON.stringify` inside `dangerouslySetInnerHTML`.
A CMS value containing `</script>` (blog title, product name, settings)
would close the tag and inject HTML. `serializeJsonLd()` escapes `<` as
`<` (same JSON, cannot terminate the script). Applied to Company,
Product and Article schemas. Still unescaped: `src/app/(main)/flash-sale/page.jsx`.

## Not verified

- Product and blog JSON-LD could not be rendered: the backend
  (`192.168.68.63:8000`) was unreachable during this session. Helpers are
  unit-checked; validate one product and one blog URL with Google's Rich
  Results Test after deploy.

## Deferred — content team (copywriting, not code)

AITDK "Question-Style Headings", "Citations & Quotations", "Content Depth".
Changing these means changing visible text/headings, which is out of scope.

## Final note — Cloudflare overrides `robots.js`

The application-level `robots.js` is not the final word on the live site.
Cloudflare's **Bot Fight Mode / AI bot blocking** and its **Managed robots.txt**
must be configured in the Cloudflare dashboard to allow `GPTBot` and
`ClaudeBot` (and any other AI search/assistant crawlers you want). Until then,
Cloudflare prepends its own `Disallow` rules to `/robots.txt` and returns
HTTP 403 to those user agents, overriding whatever `robots.js` serves.

## Other notes

- Live footer still shows "Our History"; the code already has About Us +
  Contact Us (`src/Components/Footer/About.jsx`) — production is on an older build.
- `src/Components/shared/schema/OrganizationSchema.jsx` is untracked and not
  rendered anywhere. Rendering it in addition to `CompanyJsonLd` would emit a
  duplicate Organization; recommend deleting it once the social URLs are confirmed.
