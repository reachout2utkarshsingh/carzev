# CARZev Technical SEO Audit Report

- **Target Domain:** `carzev.in` (Currently configured with placeholders to `carzev.com` in metadata)
- **Framework & Infrastructure:** React SPA on Vite, deployed on Vercel
- **Auditor:** Staff SEO & Technical Systems Engineer

This audit identifies primary indexability, architectural, and on-page SEO blockers within the CARZev codebase, outlining the corrective measures to scale organic EV traffic in India.

---

## 1. Crawlability & Indexability Audit

### robots.txt
- **Finding:** The file at [public/robots.txt](file:///Users/utkarsh/Downloads/carzev/public/robots.txt) is misconfigured. 
- **Evidence:**
  - `Sitemap: http://localhost:3000/sitemap.xml` (points to a local development environment).
  - Legacy disallow configurations: `Disallow: /?page=blog-admin` (uses parameter routing).
- **Corrective Action:** Point the Sitemap link to `https://carzev.in/sitemap.xml`. Disallow admin paths using clean URLs (`/blog-admin` and `/car-admin`).

### XML Sitemaps & Sitemap Index
- **Finding:** Single monolithic, outdated `sitemap.xml`.
- **Evidence:**
  - The [public/sitemap.xml](file:///Users/utkarsh/Downloads/carzev/public/sitemap.xml) hardcodes the `.com` TLD (`carzev.com`) rather than the target `.in` domain (`carzev.in`).
  - URLs utilize legacy parameters: `https://carzev.com/?page=detail&amp;id=tiago-ev`.
  - Missing entries for:
    - Programmatic comparison paths (`/compare/*`)
    - Buying guides (`/best-evs-under-10-lakh`, etc.)
    - Calculators (`/running-cost/*`, `/charging-cost/*`, `/range-calculator/*`)
    - Dynamic blog articles.
- **Corrective Action:** Transition to a partitioned Sitemap Index (`sitemap.xml`) pointing to:
  - `sitemap-vehicles.xml`
  - `sitemap-comparisons.xml`
  - `sitemap-calculators.xml`
  - `sitemap-articles.xml`
  All entries must use clean, SEO-friendly programmatic URL paths on the `.in` domain and automatically update when databases or articles change.

### Single Page Application (SPA) Indexing Blocker
- **Finding:** Raw HTML responses served to search crawler bots are blank shell templates.
- **Evidence:**
  - Requests to any path (e.g., `/ev/tata/nexon-ev`) are rewritten by Vercel to `index.html`, which returns an empty `<div id="root"></div>` and a javascript bundle.
  - While Googlebot renders javascript, non-JS bots (Bing, Yahoo, DuckDuckGo, and social media scraper bots) see no content, leading to zero indexable content, lack of rich snippets, and degraded organic rankings.
- **Corrective Action:** Implement **Vite Pre-rendering (SSG)** post-build. Generate static HTML files with pre-rendered semantic outlines, metadata, and JSON-LD schemas inside `dist/` directories matching the URL paths (e.g., `dist/ev/tata/nexon-ev/index.html`).

---

## 2. On-Page SEO & Metadata Audit

### Metadata Duplication & Crawler Visibility
- **Finding:** Raw head tags contain generic static placeholders.
- **Evidence:**
  - All incoming HTTP requests receive the exact same `<title>` and `<meta name="description">` from `index.html` before React mounts.
  - Social sharing bots scraping URLs will read the default home metadata instead of dynamic vehicle or comparison cards.
- **Corrective Action:** Populate metadata dynamically in raw HTML templates during the post-build SSG pre-render phase.

### Meta Titles, Descriptions, & OpenGraph
- **Finding:** Canonicals, OpenGraph, and Twitter tags are configured to the wrong domain and lack specificity.
- **Evidence:**
  - `<link rel="canonical" href="https://carzev.com/" />` points to `.com`.
  - OG/Twitter tags point to `carzev.com/favicon.png` instead of vehicle specific visual cards or correct domain endpoints.
- **Corrective Action:** Change all canonical, OG, and Twitter card URL parameters to target the dynamic path on `https://carzev.in/`.

### Heading Hierarchy (Missing H1s)
- **Finding:** Inconsistent heading structures across landing pages.
- **Evidence:**
  - The home view, listings view, and other sections often replace structural H1 headers with custom styled text nodes, weakening topical clarity for search engine bots.
- **Corrective Action:** Ensure every page template renders exactly one semantic `<h1>` tag containing target primary search keywords.

---

## 3. Structured Data (JSON-LD)

- **Finding:** Dynamic JSON-LD injection happens exclusively client-side via React.
- **Evidence:**
  - Scrapers that do not evaluate javascript will not detect product, article, or aggregate ratings schemas, missing Google Rich Result placements.
- **Corrective Action:** Hardcode the structured JSON-LD script tag inside each pre-rendered page's static HTML files.

---

## 4. Redirects & Broken Links

- **Finding:** 404 hazards on direct reload of nested paths.
- **Evidence:**
  - Navigating to `/listings` and refreshing is supported by the `vercel.json` wildcard rewrite, but search crawlers hitting paths directly will face indexing issues if routing structures are not statically represented in deployment directories.
- **Corrective Action:** Build static directory targets so paths resolve natively without needing rewrite fallbacks where possible, keeping the vercel rewrite purely as a catch-all safety net.
