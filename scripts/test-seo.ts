import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const PROD_ORIGIN = 'https://carzev.in';

let failedTests = 0;

function runTest(testName: string, assertFn: () => boolean) {
  try {
    const success = assertFn();
    if (success) {
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
      failedTests++;
    }
  } catch (error) {
    console.error(`[ERROR] ${testName} failed with error:`, error);
    failedTests++;
  }
}

function checkSeoMetrics() {
  console.log('\nRunning Automated SEO Verification Suite...');

  // A. Verify Sitemaps exist
  const sitemapFiles = ['sitemap.xml', 'sitemap-vehicles.xml', 'sitemap-comparisons.xml', 'sitemap-calculators.xml', 'sitemap-articles.xml'];
  sitemapFiles.forEach(file => {
    runTest(`Sitemap file existence: ${file}`, () => {
      const filePath = path.join(DIST_DIR, file);
      if (!fs.existsSync(filePath)) return false;
      const stat = fs.statSync(filePath);
      return stat.size > 0;
    });
  });

  // B. Sample pages to verify SEO rules
  const pagesToTest = [
    { route: '', isIndexable: true },
    { route: 'listings', isIndexable: true },
    { route: 'compare', isIndexable: true },
    { route: 'savings-calc', isIndexable: true },
    { route: 'blog', isIndexable: true },
    { route: 'blog-admin', isIndexable: false },
    { route: 'car-admin', isIndexable: false },
    { route: 'ev/tata/nexon-ev', isIndexable: true },
    { route: 'running-cost/nexon-ev', isIndexable: true },
    { route: 'best-evs-under-15-lakh', isIndexable: true }
  ];

  pagesToTest.forEach(p => {
    const pageHtmlPath = path.join(DIST_DIR, p.route, 'index.html');
    runTest(`HTML output file exists: /${p.route}`, () => fs.existsSync(pageHtmlPath));

    if (fs.existsSync(pageHtmlPath)) {
      const html = fs.readFileSync(pageHtmlPath, 'utf-8');

      // 1. Verify Title tag
      runTest(`/${p.route} has non-empty <title>`, () => {
        const match = html.match(/<title>(.*?)<\/title>/);
        return !!(match && match[1] && match[1].trim().length > 10);
      });

      // 2. Verify Meta Description
      runTest(`/${p.route} has meta description of length 100-175`, () => {
        const match = html.match(/<meta name="description" content="(.*?)"/);
        if (!match || !match[1]) return false;
        const len = match[1].trim().length;
        return len >= 100 && len <= 175;
      });

      // 3. Verify Canonical Link
      runTest(`/${p.route} has correct canonical link`, () => {
        const match = html.match(/<link rel="canonical" href="(.*?)"/);
        const expected = `${PROD_ORIGIN}/${p.route}`;
        return !!(match && match[1] === expected);
      });

      // 4. Verify OpenGraph tags
      runTest(`/${p.route} has og:title, og:description, and og:url`, () => {
        const hasOgUrl = html.includes('property="og:url"');
        const hasOgTitle = html.includes('property="og:title"');
        const hasOgDesc = html.includes('property="og:description"');
        const hasOgImage = html.includes('property="og:image"');
        return hasOgUrl && hasOgTitle && hasOgDesc && hasOgImage;
      });

      // 5. Verify Twitter card tags
      runTest(`/${p.route} has twitter cards large image summary`, () => {
        const hasTwitterCard = html.includes('name="twitter:card"');
        const hasTwitterTitle = html.includes('name="twitter:title"');
        const hasTwitterDesc = html.includes('name="twitter:description"');
        return hasTwitterCard && hasTwitterTitle && hasTwitterDesc;
      });

      // 6. Indexability / Noindex directive checks
      if (p.isIndexable) {
        runTest(`/${p.route} does NOT contain noindex tag`, () => {
          return !html.includes('content="noindex');
        });

        // Verify JSON-LD Structured schema (except core non-data compare templates if null)
        if (p.route !== 'compare') {
          runTest(`/${p.route} contains structured JSON-LD schema script`, () => {
            return html.includes('id="carzev-jsonld-schema"') && html.includes('type="application/ld+json"');
          });
        }
      } else {
        runTest(`Admin page /${p.route} contains noindex robots tag`, () => {
          const match = html.match(/<meta name="robots" content="noindex, nofollow"/);
          return !!match;
        });
      }
    }
  });

  // Output test summary
  console.log(`\nSEO Verification Summary: ${failedTests} failure(s) detected.`);
  if (failedTests > 0) {
    console.error('Build blocked: SEO requirements violated!');
    process.exit(1);
  } else {
    console.log('All SEO metrics verified. Ready for organic crawler indexing.');
  }
}

checkSeoMetrics();
