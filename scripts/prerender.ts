import fs from 'fs';
import path from 'path';
import { evModels } from '../src/data/evData';
import { EVModel } from '../src/types';
import { getBrandSlug } from '../src/utils/seoHelper';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.resolve(DIST_DIR, 'index.html');
const PROD_ORIGIN = 'https://carzev.in';

// Helper to ensure target dir exists
function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// Helper to escape XML
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function runPrerender() {
  console.log('Starting CARZev SEO Pre-rendering & Sitemap Generation...');

  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`Error: Compiled template not found at ${TEMPLATE_PATH}. Run 'npm run build' first.`);
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  // Let's gather all pages to generate
  const pages: {
    route: string;
    title: string;
    description: string;
    keywords: string;
    schema: any;
    bodyHtml: string;
    noindex?: boolean;
  }[] = [];

  // 1. Core pages
  pages.push({
    route: '',
    title: 'CARZev | Electric Vehicles in India - Price, Range, Compare & Calculator',
    description: 'Compare electric vehicles (cars, scooters, bikes) in India. Get real-world battery range, EMI, savings calculator, prices, and state FAME subsidies.',
    keywords: 'electric vehicles India, EV price India, best electric car, best electric scooter in India, EV range calculator, EV savings calculator',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'CARZev',
      'url': `${PROD_ORIGIN}/`,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${PROD_ORIGIN}/listings?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    bodyHtml: `
      <header>
        <img src="/images/logo.webp" alt="CARZev Logo" />
        <nav>
          <a href="/listings">Electric Cars</a>
          <a href="/compare">Compare Hub</a>
          <a href="/consultation">Expert Consultation</a>
          <a href="/blog">EV News Blog</a>
        </nav>
      </header>
      <main>
        <h1>Find Your Perfect Electric Vehicle in India</h1>
        <p>Explore India's most comprehensive database of EVs. Compare ex-showroom prices, certified range, charging times, and state road tax subsidies.</p>
        <div>
          <a href="/best-evs-under-10-lakh">Best EVs Under 10 Lakh</a> |
          <a href="/best-evs-under-15-lakh">Best EVs Under 15 Lakh</a> |
          <a href="/best-family-evs-india">Best Family EVs</a> |
          <a href="/best-long-range-evs">Best Long Range EVs</a>
        </div>
      </main>
    `
  });

  pages.push({
    route: 'listings',
    title: 'Electric Vehicles Catalogue | Prices, Range & Specs | CARZev',
    description: 'Browse the complete catalogue of electric cars, scooters, and bikes in India. Filter by budget, brand, and battery range.',
    keywords: 'electric cars catalogue, ev listings, electric scooter prices, tata punch ev price, mg windsor ev',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'Electric Vehicles Catalogue',
      'description': 'Browse the complete catalogue of electric cars, scooters, and bikes in India.',
      'url': `${PROD_ORIGIN}/listings`
    },
    bodyHtml: `
      <header><img src="/images/logo.webp" alt="CARZev Logo" /></header>
      <main>
        <h1>Electric Vehicles Catalogue</h1>
        <p>Search and filter through all available electric cars, scooters, and motorcycles in India.</p>
        <ul>
          ${evModels.map(ev => `
            <li>
              <a href="/ev/${getBrandSlug(ev.brand)}/${ev.id}">
                ${ev.brand} ${ev.name} - Range: ${ev.range} km, Price starts at ₹${ev.priceMin}L
              </a>
            </li>
          `).join('')}
        </ul>
      </main>
    `
  });

  pages.push({
    route: 'compare',
    title: 'Compare Electric Vehicles Side-by-Side | Specs & Range | CARZev',
    description: 'Compare battery capacity, range, charging times, power, and state subsidies of electric cars in India to pick your best EV.',
    keywords: 'compare electric cars, ev comparison tool, nexon ev vs mg zs ev, curvv ev vs punch ev',
    schema: null,
    bodyHtml: `
      <header><img src="/images/logo.webp" alt="CARZev Logo" /></header>
      <main>
        <h1>Compare Electric Vehicles Side-by-Side</h1>
        <p>Select multiple electric models from our database and compare their technical specifications side-by-side.</p>
      </main>
    `
  });

  pages.push({
    route: 'savings-calc',
    title: 'EV Cost Savings Calculator | Petrol vs Electric Savings | CARZev',
    description: 'Calculate your monthly and annual fuel savings when switching from petrol/diesel to electric vehicles in India.',
    keywords: 'ev savings calculator, fuel cost savings calculator, electric car savings, petrol vs ev savings',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'CARZev EV Cost Savings Calculator',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'All',
      'description': 'Calculate fuel savings when switching to electric vehicles.'
    },
    bodyHtml: `
      <main>
        <h1>EV Operating Cost & Fuel Savings Calculator</h1>
        <p>Calculate your daily, monthly, and yearly amortization savings when switching from a petrol or diesel car to an electric vehicle.</p>
      </main>
    `
  });

  pages.push({
    route: 'emi-calc',
    title: 'Electric Vehicle EMI Loan Calculator | CARZev',
    description: 'Estimate your monthly EMI payments for buying electric cars or scooters in India. Custom interest rates and loan tenures.',
    keywords: 'ev emi calculator, electric car loan emi, auto loan calculator india, ev finance',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'CARZev EV EMI Loan Calculator',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'All',
      'description': 'Estimate monthly EMI payments for buying electric vehicles.'
    },
    bodyHtml: `
      <main>
        <h1>EV EMI Loan Finance Calculator</h1>
        <p>Find interest rates and monthly loan repayments for buying electric vehicles in India.</p>
      </main>
    `
  });

  pages.push({
    route: 'consultation',
    title: 'Book Free EV Expert Consultation & Subsidy Guide | CARZev',
    description: 'Get personalized advice on choosing the right EV, claiming state FAME-II subsidies, road tax exemptions, and home charger installation.',
    keywords: 'ev expert consultation, electric car subsidy guide, fame 2 subsidy help, home charger installation india',
    schema: null,
    bodyHtml: `
      <main>
        <h1>Book Free EV Expert Consultation</h1>
        <p>Get professional assistance navigating road tax waivers, state FAME-II subsidies, and home wallbox installation parameters.</p>
      </main>
    `
  });

  pages.push({
    route: 'blog',
    title: 'CARZev Blog | Latest EV News, Subsidy Updates & Buying Guides',
    description: 'Stay updated on electric vehicle launches in India, FAME-II subsidy guidelines, battery tech breakthroughs, and comprehensive owner reviews.',
    keywords: 'ev news india, electric car launches, fame-ii updates, battery tech news',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': 'CARZev EV Blog',
      'description': 'Latest EV news and subsidy guides in India.'
    },
    bodyHtml: `
      <main>
        <h1>CARZev Electric Vehicle Blog</h1>
        <p>Articles, news, reviews, and insights on the electric mobility transition in India.</p>
      </main>
    `
  });

  // Admin pages (noindex)
  pages.push({
    route: 'blog-admin',
    title: 'EV Blog Management Console | CARZev',
    description: 'Manage CARZev blog articles, publish new electric vehicle guides, edit EV reviews, and customize editorial profiles inside the administrator panel.',
    keywords: 'blog admin',
    schema: null,
    noindex: true,
    bodyHtml: '<h1>Blog Admin Console</h1>'
  });

  pages.push({
    route: 'car-admin',
    title: 'EV Database Management Console | CARZev',
    description: 'Access the CARZev admin panel to update vehicle specifications, manage on-road price estimates, adjust key specifications, and update pros and cons list.',
    keywords: 'ev admin',
    schema: null,
    noindex: true,
    bodyHtml: '<h1>Database Admin Console</h1>'
  });

  // Legal pages
  pages.push({
    route: 'privacy',
    title: 'Privacy Policy | CARZev',
    description: 'Read the privacy policy of CARZev to understand how we collect, use, and protect your personal data and usage data when you browse EV specifications.',
    keywords: 'privacy policy',
    schema: null,
    bodyHtml: '<h1>Privacy Policy</h1><p>We respect your privacy and protect your personal data.</p>'
  });

  pages.push({
    route: 'terms',
    title: 'Terms & Conditions | CARZev',
    description: 'Review the terms and conditions for using the CARZev EV discovery platform, including calculators, specification comparisons, and consultation bookings.',
    keywords: 'terms of service',
    schema: null,
    bodyHtml: '<h1>Terms and Conditions</h1><p>Rules and requirements for using our calculators and catalog.</p>'
  });

  // 2. Dynamic Vehicle Detail Pages: /ev/{brand}/{model}
  evModels.forEach(ev => {
    const brandSlug = getBrandSlug(ev.brand);
    const route = `ev/${brandSlug}/${ev.id}`;
    
    const pageTitle = `${ev.brand} ${ev.name} Price, Range, Charging Time & Specs 2026 | CARZev`;
    const pageDesc = `Check out ${ev.brand} ${ev.name} features, certified ${ev.range} km ${ev.rangeType} range, ${ev.battery} battery, charging options, and on-road price starting at ₹${ev.priceMin} Lakh.`;
    const pageKeywords = `${ev.name} price, ${ev.brand} ${ev.name} range, ${ev.name} specs, ${ev.brand} electric car India`;

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': `${ev.brand} ${ev.name}`,
      'image': `${PROD_ORIGIN}${ev.image}`,
      'description': ev.description,
      'brand': {
        '@type': 'Brand',
        'name': ev.brand
      },
      'offers': {
        '@type': 'AggregateOffer',
        'lowPrice': ev.priceMin * 100000,
        'highPrice': ev.priceMax * 100000,
        'priceCurrency': 'INR',
        'offerCount': '1'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': ev.rating.toString(),
        'reviewCount': ev.reviewsCount.toString()
      }
    };

    const detailsBody = `
      <main>
        <h1>${ev.brand} ${ev.name} Electric Price & Specs</h1>
        <p>Brand: ${ev.brand} | Category: ${ev.category}</p>
        <p><strong>Ex-Showroom Price Range:</strong> ₹${ev.priceMin} - ₹${ev.priceMax || ev.priceMin} Lakh</p>
        <p>${ev.description}</p>
        
        <h2>Key Technical Specifications</h2>
        <ul>
          <li><strong>Battery Capacity:</strong> ${ev.battery}</li>
          <li><strong>Certified Range:</strong> ${ev.range} km (${ev.rangeType})</li>
          <li><strong>Peak Power:</strong> ${ev.power}</li>
          <li><strong>Engine Torque:</strong> ${ev.torque || 'N/A'}</li>
          <li><strong>Charging Time:</strong> ${ev.chargingTime}</li>
          <li><strong>Home Charging AC Rate:</strong> ${ev.chargingAC || '7.2 kW'}</li>
          <li><strong>Public Charging DC Rate:</strong> ${ev.chargingDC || '50 kW'}</li>
          <li><strong>Acceleration (0-100 kmph):</strong> ${ev.acceleration || 'N/A'}</li>
          <li><strong>Seating Capacity:</strong> ${ev.seatingCapacity} Seater</li>
        </ul>

        <h2>Pros and Cons</h2>
        <div>
          <h3>Pros</h3>
          <ul>${ev.pros.map(p => `<li>${p}</li>`).join('')}</ul>
          <h3>Cons</h3>
          <ul>${ev.cons.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>

        <h2>Frequently Asked Questions</h2>
        <h3>What is the ex-showroom price of ${ev.brand} ${ev.name} in India?</h3>
        <p>The price range starts at ₹${ev.priceMin} Lakh and goes up to ₹${ev.priceMax || ev.priceMin} Lakh.</p>
        <h3>What is the range of ${ev.brand} ${ev.name}?</h3>
        <p>It certified range is ${ev.range} km on a full charge.</p>

        <h2>Related Resources & Calculators</h2>
        <ul>
          <li><a href="/running-cost/${ev.id}">${ev.name} Running Cost Calculator</a></li>
          <li><a href="/charging-cost/${ev.id}">${ev.name} Charging Cost Estimator</a></li>
          <li><a href="/range-calculator/${ev.id}">${ev.name} Real Range Estimator</a></li>
        </ul>
      </main>
    `;

    pages.push({
      route,
      title: pageTitle,
      description: pageDesc,
      keywords: pageKeywords,
      schema: productSchema,
      bodyHtml: detailsBody
    });
  });

  // 3. Dynamic Comparison Pages: /compare/{vehicle-a}-vs-{vehicle-b}
  // Let's generate comparisons for same category pairs
  const cars = evModels.filter(e => e.category === 'cars');
  for (let i = 0; i < cars.length; i++) {
    for (let j = i + 1; j < cars.length; j++) {
      const evA = cars[i];
      const evB = cars[j];
      const route = `compare/${evA.id}-vs-${evB.id}`;

      const titleText = `${evA.brand} ${evA.name} vs ${evB.brand} ${evB.name} Comparison | CARZev`;
      const descText = `Compare ${evA.brand} ${evA.name} vs ${evB.brand} ${evB.name} side-by-side. Specs check on ex-showroom price, battery capacity, range, and fast charging.`;

      const compareBody = `
        <main>
          <h1>Compare ${evA.brand} ${evA.name} vs ${evB.brand} ${evB.name}</h1>
          <p>Analyzing side-by-side technical specs for ${evA.name} and ${evB.name}.</p>
          <table>
            <tr>
              <th>Feature</th>
              <th>${evA.name}</th>
              <th>${evB.name}</th>
            </tr>
            <tr>
              <td>Min Price</td>
              <td>₹${evA.priceMin} Lakh</td>
              <td>₹${evB.priceMin} Lakh</td>
            </tr>
            <tr>
              <td>Certified Range</td>
              <td>${evA.range} km</td>
              <td>${evB.range} km</td>
            </tr>
            <tr>
              <td>Battery Pack</td>
              <td>${evA.battery}</td>
              <td>${evB.battery}</td>
            </tr>
            <tr>
              <td>Power Output</td>
              <td>${evA.power}</td>
              <td>${evB.power}</td>
            </tr>
          </table>
          <h2>Backlink to Profiles</h2>
          <a href="/ev/${getBrandSlug(evA.brand)}/${evA.id}">View ${evA.name} Specs</a> | 
          <a href="/ev/${getBrandSlug(evB.brand)}/${evB.id}">View ${evB.name} Specs</a>
        </main>
      `;

      pages.push({
        route,
        title: titleText,
        description: descText,
        keywords: `${evA.name} vs ${evB.name}, compare ${evA.name} ${evB.name}, specs differences`,
        schema: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${PROD_ORIGIN}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'Compare', 'item': `${PROD_ORIGIN}/compare` },
            { '@type': 'ListItem', 'position': 3, 'name': `${evA.name} vs ${evB.name}`, 'item': `${PROD_ORIGIN}/${route}` }
          ]
        },
        bodyHtml: compareBody
      });
    }
  }

  // 4. Buying Guide Pages
  const guides = [
    { id: 'under-10-lakh', title: 'Best Electric Vehicles Under 10 Lakh in India 2026', desc: 'Explore the best electric vehicles and two-wheelers under 10 Lakh in India. Compare ex-showroom prices, certified driving range, battery packs, and features.' },
    { id: 'under-15-lakh', title: 'Best Electric Cars Under 15 Lakh in India 2026', desc: 'Compare ex-showroom prices, real-world driving range, safety ratings, and smart features of the best electric cars under 15 Lakh in India for budget buyers.' },
    { id: 'family', title: 'Best Family Electric Cars & SUVs in India 2026', desc: 'Find the most spacious and practical electric family cars and SUVs in India. Compare seating capacity, boot space, cabin comfort, and highway safety ratings.' },
    { id: 'long-range', title: 'Best Long Range Electric Cars in India 2026', desc: 'Check out the longest range electric cars and SUVs in India. Get detailed insights on battery capacity, fast charging speed, certified range, and real-world range.' }
  ];

  guides.forEach(g => {
    let route = '';
    if (g.id === 'under-10-lakh') route = 'best-evs-under-10-lakh';
    else if (g.id === 'under-15-lakh') route = 'best-evs-under-15-lakh';
    else if (g.id === 'family') route = 'best-family-evs-india';
    else if (g.id === 'long-range') route = 'best-long-range-evs';

    pages.push({
      route,
      title: `${g.title} | CARZev`,
      description: g.desc,
      keywords: `best evs, guides, indian evs, budget range`,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `What are the best EVs for ${g.id} in India?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `Browse the dynamic listing comparing range, prices and warranties on CARZev.`
            }
          }
        ]
      },
      bodyHtml: `
        <main>
          <h1>${g.title}</h1>
          <p>${g.desc}</p>
        </main>
      `
    });
  });

  // 5. Dynamic Calculator Pages
  const calcs = ['running-cost', 'charging-cost', 'range-calculator'];
  evModels.forEach(ev => {
    calcs.forEach(c => {
      const route = `${c}/${ev.id}`;
      const calcName = c === 'running-cost' ? 'Running Cost' : c === 'charging-cost' ? 'Charging Cost' : 'Real Range';
      const titleText = `${ev.brand} ${ev.name} ${calcName} Calculator | CARZev`;
      const descText = `Estimate real world ${calcName.toLowerCase()} of ${ev.brand} ${ev.name} in India. Interactive tool, specs and dynamic FAQs.`;

      pages.push({
        route,
        title: titleText,
        description: descText,
        keywords: `${ev.name} calculator, ${ev.name} ${c}, ev estimators`,
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': `${ev.brand} ${ev.name} ${calcName} Calculator`,
          'applicationCategory': 'BusinessApplication',
          'operatingSystem': 'All',
          'description': descText
        },
        bodyHtml: `
          <main>
            <h1>${ev.brand} ${ev.name} ${calcName} Calculator</h1>
            <p>Calculate your values dynamically for the ${ev.brand} ${ev.name} LFP battery setup.</p>
          </main>
        `
      });
    });
  });

  // Write pre-rendered HTML files
  pages.forEach(p => {
    const canonicalUrl = `${PROD_ORIGIN}/${p.route}`;
    let modifiedHtml = templateHtml;

    // 1. Inject / Replace title
    modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/, `<title>${p.title}</title>`);

    // 2. Construct SEO Head Tags block
    let seoHeadTags = `
    <meta name="description" content="${p.description}" />
    <meta name="keywords" content="${p.keywords}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${p.title}" />
    <meta property="og:description" content="${p.description}" />
    <meta property="og:type" content="${p.route.includes('blog/') ? 'article' : 'website'}" />
    <meta property="og:image" content="${PROD_ORIGIN}/favicon.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${p.title}" />
    <meta name="twitter:description" content="${p.description}" />
    <meta name="twitter:image" content="${PROD_ORIGIN}/favicon.png" />
    `;

    if (p.noindex) {
      seoHeadTags += '\n    <meta name="robots" content="noindex, nofollow" />';
    }

    if (p.schema) {
      seoHeadTags += `\n    <script id="carzev-jsonld-schema" type="application/ld+json">${JSON.stringify(p.schema)}</script>`;
    }

    // Inject seoHeadTags right after <head> or before viewport meta
    modifiedHtml = modifiedHtml.replace('<head>', `<head>${seoHeadTags}`);

    // 3. Inject semantic body HTML outline inside the root container for crawler indexability
    modifiedHtml = modifiedHtml.replace('<div id="root"></div>', `<div id="root">${p.bodyHtml}</div>`);

    // Write file
    const targetFilePath = path.join(DIST_DIR, p.route, 'index.html');
    ensureDirectoryExistence(targetFilePath);
    fs.writeFileSync(targetFilePath, modifiedHtml, 'utf-8');
  });

  console.log(`Pre-rendered ${pages.length} pages successfully!`);

  // ==========================================
  // SITEMAPS GENERATION
  // ==========================================

  // A. Vehicles sitemap
  let sitemapVehicles = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  evModels.forEach(ev => {
    const brandSlug = getBrandSlug(ev.brand);
    const loc = `${PROD_ORIGIN}/ev/${brandSlug}/${ev.id}`;
    sitemapVehicles += `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  });
  sitemapVehicles += `</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap-vehicles.xml'), sitemapVehicles, 'utf-8');

  // B. Comparisons sitemap
  let sitemapComparisons = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (let i = 0; i < cars.length; i++) {
    for (let j = i + 1; j < cars.length; j++) {
      const loc = `${PROD_ORIGIN}/compare/${cars[i].id}-vs-${cars[j].id}`;
      sitemapComparisons += `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }
  }
  sitemapComparisons += `</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap-comparisons.xml'), sitemapComparisons, 'utf-8');

  // C. Calculators sitemap
  let sitemapCalculators = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  // Add core calculator tools
  sitemapCalculators += `  <url>\n    <loc>${PROD_ORIGIN}/savings-calc</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  sitemapCalculators += `  <url>\n    <loc>${PROD_ORIGIN}/emi-calc</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  // Add vehicle calculator landing pages
  evModels.forEach(ev => {
    calcs.forEach(c => {
      const loc = `${PROD_ORIGIN}/${c}/${ev.id}`;
      sitemapCalculators += `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });
  });
  sitemapCalculators += `</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap-calculators.xml'), sitemapCalculators, 'utf-8');

  // D. Articles (blog/guides/etc.) sitemap
  let sitemapArticles = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  sitemapArticles += `  <url>\n    <loc>${PROD_ORIGIN}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  sitemapArticles += `  <url>\n    <loc>${PROD_ORIGIN}/listings</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  sitemapArticles += `  <url>\n    <loc>${PROD_ORIGIN}/blog</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  sitemapArticles += `  <url>\n    <loc>${PROD_ORIGIN}/consultation</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  guides.forEach(g => {
    let route = '';
    if (g.id === 'under-10-lakh') route = 'best-evs-under-10-lakh';
    else if (g.id === 'under-15-lakh') route = 'best-evs-under-15-lakh';
    else if (g.id === 'family') route = 'best-family-evs-india';
    else if (g.id === 'long-range') route = 'best-long-range-evs';
    sitemapArticles += `  <url>\n    <loc>${PROD_ORIGIN}/${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });
  sitemapArticles += `</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap-articles.xml'), sitemapArticles, 'utf-8');

  // E. Sitemap Index: sitemap.xml
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${PROD_ORIGIN}/sitemap-articles.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${PROD_ORIGIN}/sitemap-vehicles.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${PROD_ORIGIN}/sitemap-calculators.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${PROD_ORIGIN}/sitemap-comparisons.xml</loc>
  </sitemap>
</sitemapindex>`;
  
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapIndex, 'utf-8');
  console.log('Partitioned XML sitemaps and Sitemap Index written to dist/ successfully!');
}

runPrerender();
