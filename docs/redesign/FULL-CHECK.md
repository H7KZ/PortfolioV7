# Full portfolio check

Everything that can be verified about jankominek.com before launch, grouped by discipline, with the standard and tool for each. Written 2026-11-01 from primary sources (listed at the end). Existing harness: `apps/web/tests/redesign` (render, axe, visual, Lighthouse budgets).

Order: local production build first, then `dev.jankominek.com` through the tunnel (it sits behind Cloudflare Access), then read-only requests to production. Production and `main` are not changed. Nothing is pushed or deployed without the owner saying so. Active security probes run only against local. One heavy job at a time. Tools that are missing may be added to a scratch folder, not to the repository.

Routes: home, résumé, contact, blog, every post, seven case studies, privacy, terms, 404, each in EN and CS. Widths: 240, 320, 360, 390, 414, 600, 768, 900, 1024, 1280, 1440, 1920, 2560.

## A. An agent can prove these

### a11y: accessibility

Target: WCAG 2.2 AA on every route, AAA noted where cheap. Method: WCAG-EM style, every success criterion gets pass, fail or not applicable, not just a tool score.

- Three engines, because each misses things: axe, Pa11y (HTML_CodeSniffer) and the Lighthouse accessibility audit.
- The nine WCAG 2.2 additions, by script where possible: 2.4.11 and 2.4.12 Focus Not Obscured (the sticky header must not cover a focused element), 2.4.13 Focus Appearance, 2.5.7 Dragging Movements, 2.5.8 Target Size, 3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8 and 3.3.9 Accessible Authentication (CMS login).
- Keyboard: full tab walk of each route with screenshots of each focus stop, order, no trap, skip link, mobile menu, Escape, focus after route change, focus after form error.
- Zoom and reflow: 1.4.10 at 320 px, 1.4.4 text at 200%, full page at 400%, 1.4.12 text spacing override, 1.3.4 both orientations.
- Colour: 1.4.3 and 1.4.11 contrast including focus rings, hover and disabled states; `forced-colors`, `prefers-contrast`; simulated protanopia, deuteranopia, tritanopia, achromatopsia and blurred vision through DevTools Protocol, and no meaning carried by colour alone.
- Motion: `prefers-reduced-motion`, 2.2.2 pause, 2.3.3 animation, no flashing.
- Structure: heading outline, landmarks, one `h1`, lists, tables, accessibility tree snapshot of each route, accessible names of icon links, duplicate link text, `aria` validity.
- Forms: labels, 1.3.5 `autocomplete`, 3.3.1 to 3.3.4 errors and suggestions, live region announcements, required state.
- Language: `lang` per locale, 3.1.2 language of parts (English terms and quotes on `/cs`).
- Non-text: alt text quality by reading it, the architecture diagram's text alternative, decorative images empty, video or GIF none autoplaying.
- `cv.pdf`: tagged, title, language, reading order.
- Content on hover or focus 1.4.13, tooltips, 2.1.4 shortcuts, 2.5.1 to 2.5.4 pointer rules, 3.2.1 and 3.2.2 no surprise on focus or input.

### Performance

- Lighthouse budgets on a production build, median of at least three runs, mobile and desktop, every route type.
- Core Web Vitals targets: LCP under 2.5 s, INP under 200 ms, CLS under 0.1. Measure INP by tracing real interactions (menu, language switch, form).
- TTFB, SSR time, cache hit against miss, cold start after a CMS save.
- LCP element, its preload and `fetchpriority`. Back-forward cache eligibility, no `no-store` on public pages, no `unload` handlers.
- Over-download per width: `srcset` and `sizes` accuracy, AVIF and WebP chosen, intrinsic size, lazy loading.
- Fonts: subset, `font-display`, preload, layout shift on swap, Czech glyphs present in every font.
- JS and CSS coverage, bundle by route, long tasks, third parties, memory growth during navigation.
- Network: Brotli or zstd, HTTP/2 or HTTP/3, cache headers, ETag, redirects, `Slow 4G` with 4× CPU.
- Page weight budget and request count per route.

### Security

Tailored OWASP WSTG categories, with ASVS level 1 as a reference.

- Configuration: HTTP methods, debug output, `.git`, `.env`, backup files, source maps, directory listing, error pages leaking stacks.
- Headers: CSP through CSP Evaluator (no `unsafe-inline` or wildcards unless justified), HSTS and preload readiness, frame, referrer, permissions, COOP, CORP, CORS. Cross-check with Mozilla Observatory rules.
- TLS: `testssl.sh` or SSL Labs, protocol versions, chain, expiry, OCSP, certificate transparency.
- DNS: CAA, DNSSEC, dangling CNAMEs, SPF, DKIM, DMARC, MTA-STS, TLS-RPT.
- Input: `/media/[...path]` traversal, contact form injection, email header injection, oversized and malformed bodies, stored XSS through every `v-html` field, open redirect in redirects and `_preview`, host header, cache poisoning and deception, `x-forwarded-for` spoofing against the rate limit.
- Access: `/_internal/revalidate` and `/_preview`, CMS collections read anonymously, drafts, API keys scope, admin login lockout, Cloudflare Access coverage.
- OWASP ZAP baseline scan, then full scan on local only. Nuclei on local only.
- Client bundle: no secrets, no internal hosts, no CMS calls from the browser.
- Supply chain: `pnpm audit`, OSV-Scanner, retire.js, lockfile integrity, licence audit, gitleaks on the full history, Trivy and Dockle on images, Hadolint, actionlint and zizmor on workflows, Semgrep.
- Containers: non-root, read-only where set, resource limits, no socket access.
- `security.txt` expiry and contact.

### Privacy and law

- Every request on every route is first party, or listed in the privacy policy. Cookies, `localStorage` and fingerprinting surfaces inventoried.
- No Google Fonts or other third-party call before consent. Cloudflare beacon status recorded.
- Privacy policy matches actual processors, retention and analytics. Contact data retention in the CMS.
- EXIF and metadata stripped from images. `cv.pdf` metadata.
- Client confidentiality: no client data in images, text or alt text.
- Business identification on the site, as Czech law expects from a trader (§ 435 OZ), and terms against what is sold.
- European Accessibility Act: record whether it applies. It exempts microenterprises providing services, and the owner confirms the fit.

### SEO and sharing

- Unique title and description per route and locale, lengths, canonical to self.
- `hreflang` reciprocal on every page, self-reference, `x-default`, valid codes, canonical agreeing with the cluster.
- `sitemap.xml` lists exactly the public pages with correct `lastmod`, `robots.txt` deliberate, `noindex` where intended, soft 404s, redirect chains, trailing slash duplicates.
- JSON-LD valid against Schema.org for Person, ProfilePage, BlogPosting, CreativeWork and BreadcrumbList.
- Open Graph and X cards on every route: image size, alt, correct locale.
- `feed.xml` through the W3C feed validator. Favicon set, manifest, `theme-color`.
- Internal links: depth, orphans, anchor text.
- AI search: a deliberate rule for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and Google-Extended. `llms.txt` and `llms-full.txt` current, treated as optional because no crawler has confirmed using them.

### i18n, l10n and g11n

- Pseudo-localization: run the DOM through a +40% accented transform at each width to find clipped or broken layout and any string not from the CMS.
- Real Czech layout at each width, since Czech runs longer than English.
- Key parity between `copy.en.json` and `copy.cs.json`, no English left in Czech, CMS fallback behaviour for EN-only posts.
- CLDR plurals for Czech (one, few, many, other) in every counted string, including the reading time and the recommendations count.
- Dates: genitive months, lowercase, Prague time zone, no day shift at midnight UTC. Numbers: decimal comma, non-breaking thousands. Currency written `490 Kč`.
- Czech typography: „quotes“, en dashes in ranges, non-breaking spaces after one-letter words (k, s, v, z, o, u, a, i) and between numbers and units.
- Czech collation where lists sort. Diacritics in every font and in `cv.pdf`, feed, Open Graph and `llms` files.
- Language switch keeps the page and query. `Accept-Language` behaviour, `/cs` URLs, `lang` and `og:locale`.
- Right-to-left is not applicable, because the site has no such locale.

### Browsers and devices

- Playwright on Chromium, Firefox and WebKit, at every width. WebKit stands in for Safari, but it is not Safari.
- Device emulation: iPhone, Android, iPad, touch only, no hover, landscape.
- Baseline check of CSS and JS features with the `web-features` data, anything newer than Widely available reviewed.
- JavaScript disabled: SSR content, links and navigation still work. Failed hydration, blocked fonts, blocked images, ad blocker.
- Print: résumé and a case study. Dark and light where offered.
- Hydration mismatches logged.

### HTML, CSS and links

- Nu Html Checker on every rendered route, html-validate, duplicate ids, Stylelint.
- Lychee on every internal and external link, anchors, `mailto:`, `rel` on external links, mixed content.
- Images: dimensions, alt, no 404s, right format, no upscaling.

### Content

- `seed:v7 --dry-run` clean on local and dev. Rerun gives `0 changed`.
- Spelling and grammar with cspell and LanguageTool, EN and CS. No em dashes, placeholders, `TODO`, lorem ipsum, `undefined`.
- All visible text comes from the CMS.
- Numbers, names, dates and contact details agree across home, résumé, studies, blog, footer, `llms` files and `cv.pdf`.
- Drafts do not leak into the sitemap, feed, `llms` files or blog list. Next-case-study order wraps through seven studies.
- Every image opened and looked at, in both locales, for cropping, sharpness and confidential data.

### UX and functional

- Contact form end to end against a local mailbox: every field, error, spam guard, rate limit, double submit, failure of the mail service.
- Navigation, mobile menu, scroll lock, back button, scroll restore, anchor offset under the sticky header, skip link, `cv.pdf`, share links, `mailto:`.
- Page titles change on route change. Loading, empty and error states, CMS-driven 404 and 500.
- CMS save clears the web cache. Draft preview works and exits. Analytics events fire with Umami set and stay silent without it.

### Resilience

- CMS down: the web keeps serving cached pages. Database down. Slow CMS. Missing media.
- Restart during traffic, cold cache after deploy, oversized media upload, light local load with autocannon.

### CMS and data

- Migrations on a fresh database and on a copy of the current schema. No drift between the schema and migrations.
- Access rules per collection and global, roles, drafts, version limits.
- Hooks: rendered HTML, reading time, revalidate. Media sizes and types.

### Code and repository

- `pnpm verify`, `pnpm format:check`, `pnpm build`, `python scripts/check-doc-links.py`.
- knip for dead code, Madge for cycles, jscpd for duplicates, outdated dependencies, no `any` escapes, comments follow the house rules.
- `AGENTS.md` invariants proved one by one.

### Deployment and operations

- Clean checkout builds. Workflows match the rules. `deployment/toolkit` pinned and unmodified.
- Runbooks match the scripts. Backup verification status, restore drill on development, rollback dry run on development.
- Monitoring targets up, an alert test on development, certificate renewal date, disk and log rotation, image retention.

### Sustainability

W3C Web Sustainability Guidelines as a reference, page weight and estimated CO₂ with CO2.js, green hosting lookup, no unnecessary requests.

## B. Needs the owner's access or decision

| Check                                                               | Why                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| Public URL of dev and production through Access                     | Access policy, the agent uses a tunnel instead          |
| Cloudflare zone, WAF, Web Analytics beacon                          | Dashboard login                                         |
| Public scanners on dev: Webbkoll, Blacklight, Observatory, SSL Labs | They need a public URL. Production can run after launch |
| CMS key rotation, production admin password                         | Secrets, `OWNER-TODO.md` section 1                      |
| GitHub Environment variables, `UMAMI_WEBSITE_ID`                    | Repository settings                                     |
| Real contact form delivery                                          | Sends a real message                                    |
| Production seed, deploy and launch                                  | Only on the owner's word                                |
| Search Console, Bing Webmaster, Rich Results Test on a public URL   | Accounts, and a public URL                              |
| Scan jankominek.com with Ohlídáme                                   | It works, but it needs a go-ahead and a public site     |
| NVDA pass on this PC                                                | The owner installs it and listens                       |
| Facts in `OWNER-TODO.md` section 3, Intedat permission, `cv.pdf`    | Only the owner can settle them                          |
| Restore of a production backup on a spare host                      | Needs a host                                            |

## C. Nobody here can fully prove these

- **Native Czech.** Tools flag errors. A native reader signs it off.
- **Real Safari, iOS and old Android.** WebKit is close, but not the same. Real devices or a paid device cloud settle it.
- **Real assistive technology use.** Automated tools catch only part of WCAG. Disabled users are the real test.
- **Field performance.** Lab numbers are not Core Web Vitals. Those need weeks of real visitors at the 75th percentile.
- **Search ranking and AI citations.** Only time shows them.
- **Third parties staying correct.** LinkedIn, GitHub and client sites change.
- **How a recruiter or client reacts.** Design review is an opinion.
- **Legal correctness.** That takes a lawyer and the clients' agreement.
- **Absence of all security flaws.** A check lowers risk. An outside pen test is stronger evidence.
- **Real load and real attacks.** Load tests on production are off limits here.
- **Numbers over time.** Stated figures are true on the day they are checked.

## Output

`docs/redesign/FULL-CHECK-REPORT.md`: one row per check with passed, failed with evidence, fixed, or skipped with the reason, ordered by what a visitor would notice first. Fix only what the check proves broken and what needs no owner decision, then rerun that check. List owner decisions at the end.

## Sources

- [What's new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [web.dev: back/forward cache](https://web.dev/articles/bfcache) and [Chrome DevTools test](https://developer.chrome.com/docs/devtools/application/back-forward-cache)
- [web.dev: Fetch Priority](https://web.dev/articles/fetch-priority)
- [web.dev: speculation rules and prerendering](https://web.dev/learn/performance/prefetching-prerendering-precaching)
- [Google: localized versions of your pages](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [MDN: Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility)
- [W3C: Web Sustainability Guidelines](https://www.w3.org/blog/2023/introducing-web-sustainability-guidelines/)
- [Webbkoll](https://webbkoll.dataskydd.net/en/about) and [Blacklight](https://themarkup.org/blacklight/2020/09/22/how-we-built-a-real-time-privacy-inspector)
- [EAA microenterprise exemption, Taylor Wessing](https://www.taylorwessing.com/en/interface/2025/accessibility/key-eu-accessibility-act-exemptions-and-the-challenges-they-pose) and [Czech Act, Bird & Bird](https://cm.twobirds.com/en/insights/2025/czech-republic/czech-republic-new-act-on-accessibility-requirements)
- [Pseudo-localization, Lingoport](https://lingoport.com/blog/what-is-pseudo-localization/)
