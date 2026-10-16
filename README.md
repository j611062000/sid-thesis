# Sid Thesis

Independent Research on Technology, Business & Capital. A static, English-language publication built with Astro, TypeScript, MDX, and Content Collections for **https://sidthesis.com**.

The initial site contains one clearly labeled **upcoming research outline**, not a published article. It contains no invented research, credentials, email addresses, social accounts, or subscription forms. The RSS feed is intentionally empty until an article is published.

## Develop and verify

Use **Node.js 24 LTS** (`nvm use`) and npm. Commit `package-lock.json` for reproducible builds.

```sh
npm ci
npm run dev
```

```sh
npm run verify
npx playwright install chromium
npm run test:browser
npm run preview
```

`verify` runs Astro/TypeScript checks, publication rule tests, a production build, internal link/fragment/asset and metadata checks, and a separate fixture build exercising published articles. Browser tests cover desktop and mobile, all public pages, accessibility, theme persistence, navigation without JavaScript, and the published article template. On Linux, use `npx playwright install --with-deps chromium`.

`npm run build` generates the deployable `dist/` directory. `npm run test:content` builds synthetic test articles only in ignored `.qa/content-fixture/`; they never enter the production content directory or `dist/`. The browser suite needs both builds; run `verify` first. `ASTRO_TELEMETRY_DISABLED=1` disables Astro CLI telemetry and is set in CI.

## Publish one MDX file

Add a lowercase, hyphenated file directly under `src/content/research/`. Its filename is its permanent URL; for example, `market-structure.mdx` becomes `/research/market-structure/`. Keep the filename stable after publication.

```mdx
---
title: 'Your researched article title'
description: 'A concise, factual summary of the completed research.'
status: published
publishedAt: 2026-10-16
tags: [Technology, Business]
featured: false
---

## The question

Write the completed research here, with linked sources and explicit assumptions.
```

The archive, theme pages, reading-time estimate, related articles, sitemap, RSS, canonical URL, social metadata, and Article JSON-LD update automatically. Publication dates are displayed in UTC. `updatedAt` is optional and must not precede `publishedAt`. Set `featured: true` to feature a piece on Home; prefer a single featured entry. With multiple flagged entries, the newest published entry takes precedence. With none, Home shows the newest visible entry.

Available tags: **Technology, Business, Capital, Infrastructure, Investment**. At least one is required. Optional `image` is a root-relative PNG/JPEG/WebP path in `public/`; provide `imageAlt` with it. Without it, articles share the branded 1200 × 630 PNG. For an article body image, prefer Astro's `Image` component with an imported local file for optimized output; provide meaningful alt text and dimensions.

### Publication states

| Status                                          | Public page and archive                | RSS / Article schema |
| ----------------------------------------------- | -------------------------------------- | -------------------- |
| `draft` (default)                               | Excluded                               | Excluded             |
| `upcoming`                                      | Public outline, explicitly labeled     | Excluded             |
| `published` with a date at or before build time | Published article                      | Included             |
| `published` with a future date                  | Excluded until rebuilt after that date | Excluded             |

Upcoming and draft entries must omit `publishedAt` and `updatedAt`. To publish the initial outline, finish the actual research, replace the outline text, change `status`, and add the real publication date. A future date does **not** schedule a deployment; manually run the deployment workflow or merge a change after the date passes. Public repository source is public even when `status: draft`; keep confidential drafts outside this repository.

### Long-form formatting

Use `##` and `###` headings; a table of contents appears when there are at least two. Standard Markdown tables, fenced code blocks with language names, blockquotes, linked citations, and footnotes (`[^source]` with a matching `[^source]: ...` definition) are supported. Inline equations use `$...$`; display equations use `$$` on separate lines. KaTeX renders at build time, with no client-side math runtime. MDX also supports imported Astro components. Use actual references only; no bibliography or claims are generated automatically.

The fixture in `tests/fixtures/published.mdx` demonstrates rendering syntax and is explicitly test content. The dependency override keeps the math pipeline on the same patched KaTeX version as its styles; the fixture build tests compatibility. Review the override when updating remark/rehype.

## Configure contact and subscriptions

Edit `src/config.ts`:

- `newsletterUrl`: a real **HTTPS provider-hosted signup page**. Empty by default; Subscribe shows that email subscriptions are not open and offers RSS. Configure the provider, consent/privacy information, and delivery before adding its URL. No provider-specific integration or backend is needed.
- `contactUrl`: a verified `mailto:` address or HTTPS contact/profile URL. Empty by default; Contact explicitly says a public channel is not yet available.

There is no email collection, tracking, database, or secret configuration in this site. Theme choice is stored locally in the reader's browser; it follows system preference until a reader selects light/dark mode. Fonts are self-hosted. Basic navigation and reading work with JavaScript disabled.

## GitHub Pages deployment

This repository is **j611062000/sid-thesis**. Do not modify `j611062000.github.io` or any other repository.

1. Review and merge the implementation PR into `main` when ready to publish.
2. In this repository's **Settings → Pages → Build and deployment**, choose **GitHub Actions** as Source. Enable Actions if repository or account policy disables them.
3. The `Validate site` workflow checks PRs. `Deploy to GitHub Pages` uses the [official Astro action](https://docs.astro.build/en/guides/deploy/github/) to install, validate, build, and upload `dist/`, then the official Pages deployment action publishes it. It runs on `main` pushes or a manual dispatch on `main`; PRs never deploy.
4. The `github-pages` environment must permit deployments from `main`. The deployment job requests `pages: write` and `id-token: write`; other jobs only need repository read access.
5. Follow the domain setup below, then run the deployment workflow again if the initial run preceded Pages configuration. Require the `validate` check in branch protection if desired.

`site` is `https://sidthesis.com`, with **no repository base path**. The temporary `github.io/sid-thesis/` URL is not a supported preview of this domain-root configuration. Use `npm run preview` until the custom domain is ready.

## Custom domain and Cloudflare DNS

Do these steps in order. They are manual account/domain configuration; checking in code does not perform them.

1. **Verify ownership first.** In the owning GitHub account's **Settings → Pages**, add `sidthesis.com` and copy the exact TXT name/value GitHub provides. In Cloudflare's DNS zone, create that TXT record (normally named `_github-pages-challenge-j611062000`). Wait for propagation, then click Verify in GitHub. Keep the TXT record after verification. Never invent the verification value. See [GitHub domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).
2. **Set the repository domain.** In **j611062000/sid-thesis → Settings → Pages → Custom domain**, save `sidthesis.com`. This is required. GitHub ignores `CNAME` files for custom Actions deployments; the included `public/CNAME` only records the intended domain. See [GitHub custom domain configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
3. **Configure Cloudflare records** as below using DNS only (gray cloud). This keeps GitHub in charge of HTTPS and redirects and avoids a proxy obscuring verification. Confirm Cloudflare is the domain's authoritative DNS provider. Remove conflicting website A/AAAA/CNAME records for these names, preserving unrelated MX/TXT and mail records. Do not add wildcard records. See [Cloudflare DNS record management](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/).

| Type  | Name  | Content                | Proxy    |
| ----- | ----- | ---------------------- | -------- |
| A     | `@`   | `185.199.108.153`      | DNS only |
| A     | `@`   | `185.199.109.153`      | DNS only |
| A     | `@`   | `185.199.110.153`      | DNS only |
| A     | `@`   | `185.199.111.153`      | DNS only |
| CNAME | `www` | `j611062000.github.io` | DNS only |

Use Auto TTL. The `www` target has **no protocol, path, or repository name**. Optional IPv6: add four DNS-only AAAA records at `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`. Keep the A records too.

4. **Enable HTTPS.** Once the Pages DNS check and certificate provisioning succeed, enable **Enforce HTTPS** in repository Pages settings. DNS/certificate readiness can take up to 24 hours. GitHub should redirect `www.sidthesis.com` to the configured apex. Avoid Cloudflare Flexible SSL or redirect rules for this DNS-only setup.
5. **Verify the live site**, separately from CI:

```sh
dig +short sidthesis.com A
dig +short www.sidthesis.com CNAME
dig +short _github-pages-challenge-j611062000.sidthesis.com TXT
curl -I https://sidthesis.com/
curl -I http://sidthesis.com/
curl -I https://www.sidthesis.com/
curl -I https://sidthesis.com/research/the-economics-of-agentic-commerce/
curl -I https://sidthesis.com/rss.xml
curl -I https://sidthesis.com/sitemap-index.xml
```

Expect a valid HTTPS certificate, a successful homepage/deep link/feed/sitemap, an HTTP-to-HTTPS redirect, and a www-to-apex redirect. Open the live site on desktop and mobile and check browser navigation. A successful local build or green CI is not proof of DNS, TLS, or live deployment.

## Maintenance

- Edit design tokens in `src/styles/global.css`; layouts/components share a consistent light/dark palette.
- Edit the social artwork in `design/social-card.svg`, then run `node scripts/social-card.mjs` and commit `public/social-card.png`.
- Update dependencies intentionally, commit the lockfile, and rerun `verify` plus browser tests. Review `npm audit` findings.
- For rollback, revert the relevant commit through a PR and merge; the main workflow rebuilds and deploys the reverted source.
- No backend, database, paid hosting, or external font service is required.
- Newsreader and DM Sans are distributed under their included SIL Open Font Licenses in `public/licenses/`.

Core files: `src/config.ts` (identity/integrations), `src/content.config.ts` (schema), `src/content/research/` (articles), `src/layouts/Base.astro` (shared shell/SEO), `src/pages/research/[id].astro` (article template), `.github/workflows/` (validation/deployment).
