# Module: Deep Forensic Audit (backdoors, persistence, supply chain, build artifacts)
**Path:** the entire working tree: root dotfiles, `.git/`, `.vscode/`, `.idea/`, `.claude/`, `.kiro/`, `src/`, `public/`, root config files, `.next/` (including `standalone/`), `node_modules/` (411 packages), `package-lock.json`, and full git history (all branches)

> Audit date: 2026-11-19, `HEAD` = `6f88ab4`. Read-only: nothing was modified or fixed.
> **Method:** targeted `find`, `grep -P` and `git log -p -G` searches; AST and box-level parsing where grep was ambiguous; lockfile integrity checks; a lifecycle-script scan of every installed package; known-IOC checks; `npm audit --omit=dev`. File contents were not bulk-read.
> **Scope limit:** this audits the **repository and this machine's copy of it**. It **cannot** see the DigitalOcean droplet. A compromised server keeps its payload on the server, not in git. See the last section of this report.

---

## Threat Level

| Scope | Level | Why |
|---|---|---|
| **Malicious code in the repository / history / build output** | **CLEAN** | No web shell, backdoor, obfuscated payload, miner, persistence hook or exfiltration endpoint anywhere: working tree, all git history, `.next/` and `node_modules/`. |
| **Exploitability of the deployed app** | **CRITICAL** | `next@16.1.4` has multiple **unauthenticated RCE** advisories, one of them in the AVIF image path this project enables. That is how a droplet gets owned **without** any backdoor in the code. |
| **Secret hygiene** | **HIGH** | The live `REVALIDATION_SECRET` is copied into `.next/standalone/.env`, so it was on the droplet if the build was deployed. An older secret is in git history. `.claude/settings.json` pre-authorizes arbitrary code execution for AI agents. |

---

## Suspicious Files Found

**No malicious files were found.** Every lead that came up was investigated and resolved:

| Path | Finding | Verdict |
|---|---|---|
| *(whole tree, excluding `node_modules`)* | `.php`, `.phtml`, `.sh`, `.py`, `.pl`, `.cgi`, `.asp`, `.jsp`, `.exe`, `.dll`, `.so`, `.bat`, `.ps1`, `.vbs` files | **None.** The only native binary is `.next/standalone/node_modules/@img/sharp-win32-x64/lib/sharp-win32-x64.node`, the legitimate sharp build for Windows, produced by the local build. |
| `src/`, `public/`, root configs | `eval(`, `system(`, `exec(`, `passthru(`, `shell_exec(`, `popen(`, `atob(`, `btoa(`, `new Function(`, `\xNN` hex runs, `String.fromCharCode`, `document.write(`, base64 blobs of 300+ chars | **0 hits** |
| Git history (all commits) | the same backdoor patterns, plus `child_process`, `execSync`/`spawn`, `process.binding`, `net.connect`/`dgram` | **0 commits** add any of them. The 3 commits with `\x..\x..` sequences (`d7d8a6a`, `607e48b`, `ad260c9`) are base64 PNGs embedded in designer-exported SVGs (`public/gift-product.svg`, `public/product-details/booking-mony-icon.svg`, `points.svg`). They are benign. |
| `public/` (70 svg, 60 webp, 35 png, 9 jpg/jpeg, 4 json, 2 mp4, 1 ico, 1 html, `_redirects`) | `<script>`, `javascript:`, `on*=` handlers, `<foreignObject>`, `<iframe>`, `<embed>`, `<object>`, external `href`s in SVG/HTML/XML | **0 hits** |
| `public/blog.jpeg`, `public/flashsale/flashsale-cover.jpg` | **Content type mismatch:** these are **AVIF** files with `.jpeg`/`.jpg` extensions (relevant because AVIF is the RCE vector). | Box-parsed: standard `ftyp(28) → meta(214) → mdat` layout, **0 trailing bytes**, no embedded text. Committed 2026-04-19 and 2026-07-13 by a known developer (Kawsar Hussain) as normal design assets. **Benign mislabeling.** Note that they are still fed to the vulnerable optimizer by the app itself (`blog/[slug]/page.jsx:113`, `flash-sale/page.jsx:130`, `Blog/PostCard.jsx`). |
| `public/placeholder.jpg` | It is actually PNG. | Benign mislabeling. |
| `public/google2280e7ae197433cf.html` | The only HTML file | A Google Search Console verification token. Benign. |
| `public/_redirects` | `/* /index.html 200` | A leftover Netlify/SPA rule. Ignored by Next.js. Benign but obsolete. |
| `public/{brands,card,category,flashsale}/*.json` | Static mock data | Only CloudFront URLs. Benign. |
| `.git/hooks/` | Non-sample hooks | **None** (only `*.sample`). |
| `.git/config` | Remotes, `core.hooksPath`, credential helpers | One remote: `github.com/alamin-shot/tekzo_existing_website.git`. No hooksPath or alias tricks. The history also references `github.com:Salamat-Innovation/Next-Js-Frontend` (the original org repo). Clean. |
| `.vscode/settings.json` | Tasks, launch configs, auto-run | Only 2 Vim-extension options. **No `tasks.json` and no `"runOn": "folderOpen"` auto-tasks.** Clean. |
| `.idea/*` (8 files) | Run configurations, external tools | Only module, VCS, JS-language-level and PHP-inspection settings. No run configurations or external tools. Clean, but tracked in git because of the `.gitignore` leading-space bug. |
| **`.claude/settings.json`** (tracked in git) | AI-agent permission allowlist | **Not malware, but a standing risk.** It pre-approves `Bash(python3 -c ' *)`, `Bash(node -e ' *)`, `Bash(npx next *)` and `pkill -f "next start"` for any Claude Code session opened in this repo. That allows **arbitrary code execution without a prompt**: a prompt-injected instruction (for example from CMS content or a pasted log) could run any script on a developer machine. It also leaks a developer's local path (`/Users/obak/...`) and a local API host (`salamat-web-api.test`). |
| `.kiro/PERSISTENT_SCROLLBAR_GUIDE.md`, `PREOWNED_CHECKOUT_GUIDE.md` | Unknown dotfolder | AI-assistant docs. Benign. |
| Root dotfiles | `.bash_history`, `.ssh/`, `.npmrc`, `.yarnrc`, `.profile`, unknown dotfiles | **None present.** |

---

## Dangerous Dependencies

**No malicious packages.** Many **vulnerable** ones.

**Supply-chain integrity: clean.**
- **Direct dependencies:** all 20 names are the genuine packages (repository URLs verified against each installed `package.json`). No typosquats such as `reac-dom` or `nextt`. `spacing@0.3.0` is a genuine but **unused** CSS-only package (no JS, no scripts).
- **Lockfile:** 485 of 485 entries resolve from `registry.npmjs.org`, and **485 of 485 carry `sha512` integrity hashes**. There are no git, tarball or mirror sources.
- **Root `package.json` lifecycle scripts:** none (`dev`, `build`, `start`, `lint`, `tailwind:init` only).
- **Lifecycle scripts across all 411 installed packages:** only two run on a registry install:
  - `sharp@0.34.5` `install: node install/check.js`: a 383-byte file that only requires `../lib/libvips`. Clean.
  - `unrs-resolver@1.11.1` `postinstall: napi-postinstall …`: its only network host is `registry.npmjs.org`. Clean.
  - The 22 `prepare` scripts (husky, tshy and others) **do not execute** for registry installs.
- **Known 2025 npm-compromise indicators:**
  - Shai-Hulud worm files (`setup_bun.js`, `bun_environment.js`, `trufflehog`, `webhook.site` beacons): **0**.
  - September 2025 hijacked versions (chalk 5.6.1, debug 4.4.2, ansi-styles 6.2.2, strip-ansi 7.1.1, color-convert 3.1.1, supports-color 10.2.1, `@ctrl/tinycolor` 4.1.1/4.1.2, duckdb 1.3.3, and others): **0 matches** in the lockfile.

**Vulnerabilities** (`npm audit --omit=dev`): **1 critical, 7 high, 5 moderate.**

| Package (installed) | Severity | Key issues | Fix |
|---|---|---|---|
| **`next` 16.1.4** | **CRITICAL** | **Unauthenticated RCE**: Image Optimization with AVIF (`GHSA-2xp9-vwfh-vxw4`), with SVG (`GHSA-2464-fhr4-w9xw`), `use cache` typed arrays (`GHSA-673q-mjm6-r5xr`), Windows hosts (`GHSA-p293-qw3h-jr36`). SSRF in Image Optimization, Server Actions and rewrites. Middleware/proxy bypasses. More than 10 DoS issues. Cache poisoning. A Server Actions CSRF bypass. | **≥ 16.4.6** |
| `sharp` 0.34.5 | HIGH | libvips, libheif and librsvg CVEs (the image decoders behind the optimizer) | ≥ 0.35.5 (via the Next upgrade) |
| `axios` 1.13.2 (installed, **never imported**) | HIGH | About 30 advisories: SSRF, prototype-pollution gadgets, header injection, DoS | Remove the dependency |
| `undici` 7.24.7 | HIGH | TLS validation bypasses, cache poisoning, DoS | `npm audit fix` |
| `postcss` (via next) | HIGH | Arbitrary `.map` file read via `sourceMappingURL` | via the Next upgrade |
| `form-data`, `nanoid`, `source-map-js` | HIGH | CRLF injection, infinite loops, event-loop DoS | `npm audit fix` |
| `dompurify` (via `isomorphic-dompurify`) | MODERATE | Multiple sanitizer bypasses (< 3.4.x) | Upgrade, because this app relies on it for CMS HTML |
| `follow-redirects`, `baseline-browser-mapping`, `@tailwindcss/typography` → `postcss-selector-parser` | MODERATE | Header leak, DoS | `npm audit fix` |

---

## Exfiltration Vectors

**No exfiltration code was found.** Every outbound destination is accounted for.

**Root configs** (`next.config.mjs`, `tailwind.config.js`, `postcss.config.mjs`, `eslint.config.mjs`, `src/proxy.js`):
- No imports beyond `@tailwindcss/typography`, `eslint/config` and `eslint-config-next`.
- No `fetch`, `child_process` or `eval`.
- The 12 "net" matches in `next.config.mjs` are the security-header strings and the `remotePatterns` hostnames.
- `proxy.js` only redirects to its own origin and calls `${NEXT_PUBLIC_API_URL}/customer/profile`.

**Hard-coded IP addresses:** **none used as network endpoints.** A URL or `host:port` context search across `src`, `public`, the configs, `.next/static`, `.next/server` and `standalone/server.js` returned 0 hits. The dotted-quad strings found (for example `43.5.5.8`) are numbers inside `.js.map` source maps.

**Suspicious TLDs** (`.ru`, `.xyz`, `.top`, `.onion`, `.tk`, `.cn`, `.su`, …): **none.** All hits were JS property accesses such as `e.style.top` and `t.click`.

**Complete outbound map:**
| Destination | Purpose | Origin of reference |
|---|---|---|
| `web-api.tekzo.com.bd` (`NEXT_PUBLIC_API_URL`) | Own backend API | `src/lib/api.js`, `utils/*`, `proxy.js`, `app/api/*`, and 9 client components |
| `d2c2zgda4zwbg9.cloudfront.net`, `web-api.salamatinnovation.com` (http and https) | Own image CDN and hosts (fetched by the server's image optimizer) | `next.config.mjs` `remotePatterns`, `src/Components/SearchModal/ModalContent.jsx` |
| `www.googletagmanager.com` (`GTM-P2B3DNBX`) | Analytics; loads FB, TikTok and Clarity pixels **from the GTM container config, outside this repo** | `src/Components/GTM/GTM.jsx` |
| `maps.google.com`, `www.google.com` | Map iframes | Contact and outlet pages |
| `cdn-icons-png.flaticon.com` | One icon image | Source |
| `wa.me`, `m.me`, social profiles | Links, not requests | Source |
| `nexthand.com`, `sumashtech.com`, `static.xx.fbcdn.net`, `i.guim.co.uk`, `cdn.mos.cms.futurecdn.net`, `sm.pcmag.com` | **CMS content only**: news articles from the backend, prerendered into `.next/server/app/news.html`, with hotlinked third-party images and links to an external shop (nexthand.com) | Backend data, **not code** (0 references in `src/`). Not exfiltration. It does mean the **CMS can inject arbitrary HTML**, which is mitigated by DOMPurify, itself outdated. |

**Build output** (`.next/`, BUILD_ID `0mAy2txQcnbht-uORCP0d`):
- **Provenance:** every non-cache artifact has an mtime between **2026-11-19 10:11 and 10:57**, which is this machine's own build window. There are no files modified after the build and no foreign additions.
- **Client chunks** (`.next/static`): only the domains above, plus library documentation URLs (`nextjs.org`, `react.dev`, `github.com`, `stackoverflow.com`).
- **Server bundles** (`.next/server`): `child_process`, `execSync`, `spawn(`, `process.binding`, `require("net"/"dgram")`, `/bin/sh`, `/bin/bash`, `powershell`, `xmrig`, `stratum`, `curl `, `wget `, `base64 -d`: **0 files** each.
- **Prerendered HTML** (`.next/server/app/*.html`): **no external `<script src>`**, no suspicious inline scripts (`atob`, `eval`, `fromCharCode`, hex), no `on*=` handlers, no `javascript:` URLs. Iframes and scripts reference only `googletagmanager.com` (39), `maps.google.com` (1) and `www.google.com` (1).

---

## Hidden Files Audit

`ls -la` at the root shows `.claude/`, `.env`, `.git/`, `.gitignore`, `.idea/`, `.kiro/`, `.next/` and `.vscode/`, plus normal project files and `docs/` (this audit). **There is no `.bash_history`, `.ssh/`, `.npmrc`, `.yarnrc`, `.profile`, `.htaccess` or unexplained dotfile.**

| Item | Status |
|---|---|
| `.env` | **All 5 variables commented out** (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_URL`, `NODE_ENV`, `NEXT_PUBLIC_GTM_ID`, `REVALIDATION_SECRET`). No unknown variables and no attacker hosts. Not tracked in git (confirmed: never committed). |
| **`.next/standalone/.env`** | **Contains the live values uncommented, including `REVALIDATION_SECRET` (64 chars).** `next build` with `output: "standalone"` copies `.env` into the deployable folder. **If this folder (or one like it) was uploaded to the droplet, the secret was on the compromised machine.** It must be rotated. |
| Other env files (`.env.local`, `.env.production`, …) | None on disk. A `.env.example` existed in history (`c176b98`, 2026-07-24), later deleted, with an **empty** `REVALIDATION_SECRET=`. Harmless. |
| **Git history secret** | Commit **`d70edce`** (2026-08-04, Kawsar Hussain, "added project config files for read project to a developer") added `REVALIDATION_SECRET=<24-char value>` to `ARCHITECTURE.md`/`README.md`. Those docs were later removed, **but the value remains in history** on GitHub. It **differs** from the current 64-char secret, so it is probably dead, but confirm the backend no longer accepts it. |
| `.git/` | No custom hooks, one remote, no `hooksPath`. Authors are only `Kawsar Hussain` / `kawsar-hussain` (679 commits) and `khokon` / `khokonahmeddev` / `Khokon Ahmed` (368 commits): the two known previous developers. **No unknown committer identities.** |
| `.vscode/`, `.idea/` | Clean (see above). Tracked because of the `.gitignore` leading-space bug. |
| `.claude/settings.json` | **Arbitrary-execution allowlist for AI agents** (see above). |
| `.kiro/` | AI-assistant markdown guides. Benign. |

---

## Final Verdict

**The source code is safe to reuse. Nothing in it was planted by the previous developers or by an attacker.** The working tree, all git history, `public/`, the configs, the build output and the 411 installed packages show **no** web shells, backdoors, obfuscation, persistence hooks, typosquats, worm indicators or exfiltration endpoints. The droplet was most likely compromised through **vulnerable framework code** (`next@16.1.4` RCE), not through **malicious project code**.

What to keep and what to destroy:

| Artifact | Action | Reason |
|---|---|---|
| `src/`, `public/`, `package.json`, configs | **Keep** | Clean. (Separately, delete the dead files and rename the mislabeled AVIF assets.) |
| `package-lock.json` | **Regenerate** | It is not malicious (integrity verified), but it pins vulnerable `next`, `sharp`, `undici`, `axios` and others. Run `npm install next@latest react@latest react-dom@latest` (target ≥ 16.4.6), remove `axios` and `spacing`, run `npm audit fix`, and commit the new lockfile. |
| `node_modules/` | **Delete** | It is not infected, but it holds the vulnerable versions plus **Windows** native binaries (`sharp-win32-x64`). The Linux droplet must install its own: `npm ci` on the server or in CI. |
| `.next/` (including `standalone/`) | **Delete, and never upload it** | It contains the live `REVALIDATION_SECRET` in `standalone/.env`, Windows binaries, and output from the vulnerable Next version. Build fresh on the new droplet or in CI. |
| The old droplet | **Do not reuse.** Snapshot it for forensics, then destroy it. | This repo cannot clear it. Persistence (cron, systemd, `authorized_keys`, `/tmp` binaries, a modified `.next` or `node_modules` on the server) lives on the box. Use the checklist in `99-traffic-spike.md` item 2. |

**Before redeploying:**
1. Rotate `REVALIDATION_SECRET`, DigitalOcean API tokens, SSH keys, and every backend, DB, mail or payment credential that existed on the droplet. If the Laravel API shared that droplet (both domains returned 522), **rebuild and audit the backend too**.
2. Confirm that the old secret from commit `d70edce` is rejected. If the GitHub repo was ever public or shared, consider purging it from history with `git filter-repo` (coordinate with collaborators).
3. Remove `.claude/settings.json` from git (or strip the `python3 -c *`, `node -e *` and `npx next *` wildcards), and add `.claude/` to `.gitignore` together with the fixed `.idea/` and `.kiro/` entries.
4. Audit the GTM container `GTM-P2B3DNBX` for unknown Custom HTML tags. That is the only path by which third-party script reaches visitors without being in this repo.
5. Rename `public/blog.jpeg` and `public/flashsale/flashsale-cover.jpg` to `.avif` (or re-export them as real JPEGs), and disable AVIF in `images.formats` until the Next upgrade is verified.
