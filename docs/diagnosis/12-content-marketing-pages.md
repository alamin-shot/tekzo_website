# Module: Content & Marketing Pages
**Path:** `src/app/(main)/{about-us, blog, blog/[slug], news, careers, careers/apply/[slug], careers/application-form, faq, policy/[slug], outlets, outlets/[id], contact-us, partners/**, (claim)/**, tekzo-care, discovery}`, `src/Components/{AboutUs, Blog, Careers, Claim, Contact, Partners, TekzoCare, news}/**`, `src/Components/ReuseableComponent/Form/BusinessForm.jsx`, `src/Components/ReuseableComponent/JobApplicationForm/*`

## 1. Critical Bugs & Security Risks
- **CMS HTML injection surface.** Blog (`blog/[slug]/page.jsx`), policy (`policy/[slug]`), outlets (`outlets/[id]`), FAQ (`faq/TekzoFAQ.jsx`), news (`news/News.jsx`) and About (`OurFeatures.jsx`) all use `dangerouslySetInnerHTML`. The grep shows each references `formatHtml`, which is good, but `formatHtml` regex-rewrites HTML **after** DOMPurify (see `04` §1). Move to DOMPurify hooks and add a lint guard.
- **Partner and B2B forms are fully client pages.** `partners/{page, b2b-register, become-a-dealer, corporate, franchise, retailer}/page.jsx` are all `"use client"`, each rendering `BusinessForm.jsx` (817 lines, no `"use client"` directive of its own; see `04`). There is no schema validation, and no spam protection is visible (no CAPTCHA or honeypot). These public lead-capture forms are spam and abuse magnets.
- **Contact form:** `Contact/actions.js` (30 lines) is a Server Action. Confirm it validates input server-side (Zod), rate-limits, and does not echo raw backend errors.
- **Job applications:** `JobApplicationForm.jsx` (352) uploads CVs via the generic BFF multipart pass-through. Validate MIME type (PDF/DOC) and size, and ensure the backend stores the files privately.
- **Warranty claims:** `/customer/warranty-claims` is in the BFF guest allow-list (`api/client-fetch/route.js:11`). Unauthenticated users can submit claims, which is presumably intended, but it needs rate limiting and CAPTCHA. `ClaimWarranty.jsx` (222) and `HowToClaimClient.jsx` (347) are client-heavy.
- **`discovery/page.jsx` (634 lines)** is a huge page file. Inferred: likely hard-coded marketing content. Check for embedded third-party iframes or scripts that would need CSP `frame-src` entries.

## 2. Architecture Violations (vs. Master Rules)
- **Client/Server Boundaries:**
  - The `partners/*` pages are `"use client"` at page level. Make the page a server shell (metadata, heading) and the form a client island with a Server Action submit.
  - `(claim)/how-to-active/page.jsx` is `"use client"` for a 22-line page.
  - `Careers/CareersClient.jsx`, `Claim/HowToClaimClient.jsx`, `AboutUs/DynamicPill/*` (tab pills) and `TekzoCare/*` (seven sections, several over 100 lines): most of this content is static marketing copy rendered client-side for tab or animation effects. Use CSS-only tabs (`:target`/radio) or tiny client tab switchers, and keep the content server-rendered for SEO.
- **State Management:** About-us "dynamic pills" tab state should be a URL hash or param (`?tab=stores`) so sections are linkable. Form state should use react-hook-form + Zod.
- **File Size (over 100 lines):** `BusinessForm.jsx` (817), `discovery/page.jsx` (634), `JobApplicationForm.jsx` (352), `HowToClaimClient.jsx` (347), `news/News.jsx` (290), `outlets/[id]/page.jsx` (274), `ClaimWarranty.jsx` (222), `blog/[slug]/page.jsx` (210), `careers/apply/[slug]/page.jsx` (193), `TekzoCareHero.jsx` (190), `PostCard.jsx` (171), `AboutStores.jsx` (168), `ContactForm.jsx` (165), `contact-us/page.jsx` (161), `outlets/page.jsx` (151), `BlogContent.jsx` (147), `OurFeatures.jsx` (141), `AboutHeading.jsx` (130), `TekzoCareAbout.jsx` (119), `faq/TekzoFAQ.jsx` (113), `PartnerCard.jsx` (111), `TekzoCareFeatures.jsx` (105), `TekzoCarePromises.jsx` / `TekzoCareValueProposition.jsx` (101).
  - Move static copy (discovery, TekzoCare, About, FAQ) into data files or the CMS, and render it with small generic section components.
- **TypeScript:** blog posts, policies, outlets, careers, FAQs and news are untyped CMS payloads. Add one Zod schema per content type in `lib/api`.

## 3. Duplication & Technical Debt
- **Three news renderers** (`news/News.jsx`, `news/NewsHomePage.jsx` (unused), `HomePageNews/HomePageNews.jsx`) plus `Home/NewsCoverage` (unused).
- **Two FAQ implementations:** `faq/TekzoFAQ.jsx` (113) vs `Home/HomeFAQ/HomeFAQ.jsx` (416). Make one `<Faq items>`.
- **The partners pages are five near-identical 25-27 line files.** Make one dynamic route `partners/[type]` with a config map.
- `careers/application-form/page.jsx` (8) vs `careers/apply/[slug]` (193): two application entry points.
- `(claim)/claim-your-warranty` (13) and `(claim)/how-to-claim` (13) are thin wrappers. Fine, but `how-to-active` is client-side for no reason.
- `AboutUs/DynamicPill/AboutBrands/AboutBrands.jsx` is **unused**. `AboutUs/ReuseableComponent/AboutSectionHeading.jsx` duplicates the generic heading components (see `04`).
- `Blog/GradeBadge.jsx` is used by pre-owned devices, so it lives in the wrong folder.

## 4. Data Fetching & Performance
- **Rendering:** mostly ISR (`revalidate = 3600` on about-us, contact-us, policy, tekzo-care). `policy/[slug]` and `outlets/[id]` have `generateStaticParams` (SSG plus ISR). That is a good base.
- `blog/[slug]`, `blog`, `news`, `careers` and `faq` have **no explicit `revalidate`**. They rely on per-fetch `lib/api` options. Confirm that every blog/news fetcher has tags, so the `api/revalidate` webhook covers them (the visible switch covers brand, category, product, review, featured and offer; verify blog, news, policy and faq cases exist further down the 241-line route).
- **Images:** blog and news cards, outlet photos and team members (`/our-teams` returns a **raw array**, unlike every other endpoint, so the API is inconsistent).
- **Bundle:** these pages are mostly static, so client components here are pure overhead.

## 5. Actionable Refactor Checklist
- [ ] 1. Convert the `partners/*` pages into one server route `partners/[type]` with a client form island. Add Zod, a honeypot or CAPTCHA, and a Server Action submit with rate limiting.
- [ ] 2. Split `BusinessForm.jsx` into a config-driven form (≤100-line files) and add `"use client"` where needed.
- [ ] 3. Add server-side validation and rate limiting to the contact, job application and warranty claim submissions. Validate the upload MIME type and size.
- [ ] 4. Move the static marketing copy (discovery, TekzoCare, About, FAQ) into data or the CMS. Render it with generic server section components, and make the tabs URL/hash-driven.
- [ ] 5. Consolidate the FAQ components and the news components. Delete `AboutBrands.jsx`, `NewsHomePage.jsx` and `NewsCoverage.jsx`.
- [ ] 6. Make sure every content fetcher has cache tags and that `api/revalidate` handles blog, news, policy, faq, careers and outlets.
- [ ] 7. Move `GradeBadge` to `Components/ui/`.
- [ ] 8. Add Zod and TS types for each CMS content type.
