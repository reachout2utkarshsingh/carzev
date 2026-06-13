import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import CategoryView from './components/CategoryView';
import DetailView from './components/DetailView';
import CompareView from './components/CompareView';
import EMIView from './components/EMIView';
import SavingsView from './components/SavingsView';
import ConsultationView from './components/ConsultationView';
import PrivacyView from './components/PrivacyView';
import TermsView from './components/TermsView';
import BlogView from './components/BlogView';
import BlogAdminView from './components/BlogAdminView';
import CarAdminView from './components/CarAdminView';
import BuyingGuideView from './components/BuyingGuideView';
import CalculatorLandingView from './components/CalculatorLandingView';
import { PageType, EVModel, BlogPost } from './types';
import { evModels, updateEvModels } from './data/evData';
import { getBrandSlug } from './utils/seoHelper';
import { getAllEVs } from './lib/evService';
import { getBlogPosts } from './lib/blogService';
import { motion, AnimatePresence } from 'motion/react';

const parseLocation = (): { page: PageType; selectedEVId: string; extraData?: any } => {
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  
  if (path === '' || path === 'home') {
    return { page: 'home', selectedEVId: 'nexon-ev' };
  }
  if (path === 'listings') {
    return { page: 'listings', selectedEVId: 'nexon-ev' };
  }
  if (path === 'compare') {
    return { page: 'compare', selectedEVId: 'nexon-ev' };
  }
  if (path === 'savings-calc' || path === 'savings') {
    return { page: 'savings-calc', selectedEVId: 'nexon-ev' };
  }
  if (path === 'emi-calc' || path === 'emi') {
    return { page: 'emi-calc', selectedEVId: 'nexon-ev' };
  }
  if (path === 'consultation') {
    return { page: 'consultation', selectedEVId: 'nexon-ev' };
  }
  if (path === 'privacy') {
    return { page: 'privacy', selectedEVId: 'nexon-ev' };
  }
  if (path === 'terms') {
    return { page: 'terms', selectedEVId: 'nexon-ev' };
  }
  if (path === 'blog') {
    return { page: 'blog', selectedEVId: 'nexon-ev' };
  }
  if (path === 'blog-admin') {
    return { page: 'blog-admin', selectedEVId: 'nexon-ev' };
  }
  if (path === 'car-admin') {
    return { page: 'car-admin', selectedEVId: 'nexon-ev' };
  }

  // Programmatic URL structures
  if (path.startsWith('ev/')) {
    const parts = path.split('/');
    if (parts.length === 3) {
      const modelSlug = parts[2];
      const matchedEV = evModels.find(e => e.id.toLowerCase() === modelSlug || e.id.replace(/[^a-z0-9]/g, '') === modelSlug.replace(/[^a-z0-9]/g, ''));
      if (matchedEV) {
        return { page: 'detail', selectedEVId: matchedEV.id };
      }
    }
  }

  if (path.startsWith('compare/')) {
    const parts = path.split('/');
    if (parts.length === 2 && parts[1].includes('-vs-')) {
      const vehicles = parts[1].split('-vs-');
      if (vehicles.length === 2) {
        const findModel = (slug: string) => {
          const clean = slug.replace(/[^a-z0-9]/g, '');
          return evModels.find(m => 
            m.id.toLowerCase() === slug || 
            m.id.replace(/[^a-z0-9]/g, '') === clean ||
            `${m.brand}-${m.name}`.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
          );
        };
        const evA = findModel(vehicles[0]);
        const evB = findModel(vehicles[1]);
        if (evA && evB) {
          return { page: 'compare', selectedEVId: evA.id, extraData: { compareIds: [evA.id, evB.id] } };
        }
      }
    }
  }

  if (path === 'best-evs-under-10-lakh') {
    return { page: 'buying-guide', selectedEVId: 'under-10-lakh' };
  }
  if (path === 'best-evs-under-15-lakh') {
    return { page: 'buying-guide', selectedEVId: 'under-15-lakh' };
  }
  if (path === 'best-family-evs-india') {
    return { page: 'buying-guide', selectedEVId: 'family' };
  }
  if (path === 'best-long-range-evs') {
    return { page: 'buying-guide', selectedEVId: 'long-range' };
  }

  if (path.startsWith('running-cost/') || path.startsWith('charging-cost/') || path.startsWith('range-calculator/')) {
    const parts = path.split('/');
    if (parts.length === 2) {
      const vehicleSlug = parts[1];
      const matchedEV = evModels.find(e => e.id.toLowerCase() === vehicleSlug || e.id.replace(/[^a-z0-9]/g, '') === vehicleSlug.replace(/[^a-z0-9]/g, ''));
      if (matchedEV) {
        return { page: 'calculator-landing', selectedEVId: matchedEV.id, extraData: parts[0] };
      }
    }
  }

  // Fallback check if the path matches any EV
  const cleanPath = path.replace(/[^a-z0-9]/g, '');
  const matchedEV = evModels.find(
    (ev) => 
      ev.id.toLowerCase() === path || 
      ev.id.replace(/[^a-z0-9]/g, '') === cleanPath ||
      (ev.brand + ev.name).toLowerCase().replace(/[^a-z0-9]/g, '') === cleanPath
  );

  if (matchedEV) {
    return { page: 'detail', selectedEVId: matchedEV.id };
  }

  const pageParam = searchParams.get('page');
  const idParam = searchParams.get('id');
  if (pageParam) {
    return { 
      page: pageParam as PageType, 
      selectedEVId: idParam || 'nexon-ev' 
    };
  }

  return { page: 'home', selectedEVId: 'nexon-ev' };
};

export default function App() {
  const initialLoc = parseLocation();
  const [currentPage, setCurrentPage] = useState<PageType>(initialLoc.page);
  const [selectedEVId, setSelectedEVId] = useState<string>(initialLoc.selectedEVId);
  const [extraData, setExtraData] = useState<any>(initialLoc.extraData);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  // Dynamic SEO metadata & JSON-LD schema updates
  useEffect(() => {
    // 1. Determine title, description, keywords, and schema based on page
    let title = 'CARZev | Electric Vehicles in India - Price, Range, Compare & Calculator';
    let description = 'Compare electric vehicles (cars, scooters, bikes) in India. Get real-world battery range, EMI, savings calculator, prices, and state FAME subsidies.';
    let keywords = 'electric vehicles India, EV price India, best electric car, best electric scooter in India, EV range calculator, EV savings calculator';
    let schemaData: any = null;
    let ev: EVModel | undefined;

    if (currentPage === 'home') {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'CARZev',
        'url': 'https://carzev.in/',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://carzev.in/listings?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      };
    } else if (currentPage === 'listings') {
      title = 'Electric Vehicles Catalogue | Prices, Range & Specs | CARZev';
      description = 'Browse the complete catalogue of electric cars, scooters, and bikes in India. Filter by budget, brand, and battery range.';
      keywords = 'electric cars catalogue, ev listings, electric scooter prices, tata punch ev price, mg windsor ev';
      
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'Electric Vehicles Catalogue',
        'description': description,
        'url': 'https://carzev.in/listings',
        'hasPart': evModels.slice(0, 10).map((item) => ({
          '@type': 'Product',
          'name': item.name,
          'brand': {
            '@type': 'Brand',
            'name': item.brand
          },
          'image': `https://carzev.in${item.image}`,
          'offers': {
            '@type': 'AggregateOffer',
            'lowPrice': item.priceMin * 100000,
            'highPrice': item.priceMax * 100000,
            'priceCurrency': 'INR'
          }
        }))
      };
    } else if (currentPage === 'detail') {
      ev = evModels.find(m => m.id === selectedEVId);
      if (ev) {
        title = `${ev.brand} ${ev.name} Price, Range, Charging Time & Specs 2026 | CARZev`;
        description = `Check out ${ev.brand} ${ev.name} features, certified ${ev.range} km ${ev.rangeType} range, ${ev.battery} battery, charging options, and on-road price starting at ₹${ev.priceMin} Lakh.`;
        keywords = `${ev.name} price, ${ev.brand} ${ev.name} range, ${ev.name} specs, ${ev.name} electric car India`;
        
        schemaData = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': `${ev.brand} ${ev.name}`,
          'image': `https://carzev.in${ev.image}`,
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
          },
          'additionalProperty': [
            { '@type': 'PropertyValue', 'name': 'Battery Capacity', 'value': ev.battery },
            { '@type': 'PropertyValue', 'name': 'Driving Range', 'value': `${ev.range} km (${ev.rangeType})` },
            { '@type': 'PropertyValue', 'name': 'Peak Power', 'value': ev.power },
            { '@type': 'PropertyValue', 'name': 'Top Speed', 'value': ev.topSpeed },
            { '@type': 'PropertyValue', 'name': 'Acceleration', 'value': ev.acceleration }
          ]
        };
      }
    } else if (currentPage === 'compare') {
      if (extraData && extraData.compareIds && extraData.compareIds.length === 2) {
        const evA = evModels.find(m => m.id === extraData.compareIds[0]);
        const evB = evModels.find(m => m.id === extraData.compareIds[1]);
        if (evA && evB) {
          title = `${evA.brand} ${evA.name} vs ${evB.brand} ${evB.name} Comparison | CARZev`;
          description = `Compare ${evA.brand} ${evA.name} vs ${evB.brand} ${evB.name} side-by-side. Specs check on ex-showroom price, battery capacity, range, and fast charging.`;
          keywords = `${evA.name} vs ${evB.name}, compare electric cars, compare ${evA.name} ${evB.name}`;
          
          schemaData = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://carzev.in/' },
              { '@type': 'ListItem', 'position': 2, 'name': 'Compare', 'item': 'https://carzev.in/compare' },
              { '@type': 'ListItem', 'position': 3, 'name': `${evA.name} vs ${evB.name}`, 'item': `https://carzev.in/compare/${evA.id}-vs-${evB.id}` }
            ]
          };
        }
      } else {
        title = 'Compare Electric Vehicles Side-by-Side | Specs & Range | CARZev';
        description = 'Compare battery capacity, range, charging times, power, and state subsidies of electric cars in India to pick your best EV.';
        keywords = 'compare electric cars, ev comparison tool, nexon ev vs mg zs ev, curvv ev vs punch ev';
      }
    } else if (currentPage === 'savings-calc') {
      title = 'EV Cost Savings Calculator | Petrol vs Electric Savings | CARZev';
      description = 'Calculate your monthly and annual fuel savings when switching from petrol/diesel to electric vehicles in India.';
      keywords = 'ev savings calculator, fuel cost savings calculator, electric car savings, petrol vs ev savings';
      
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'CARZev EV Cost Savings Calculator',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'description': description
      };
    } else if (currentPage === 'emi-calc') {
      title = 'Electric Vehicle EMI Loan Calculator | CARZev';
      description = 'Estimate your monthly EMI payments for buying electric cars or scooters in India. Custom interest rates and loan tenures.';
      keywords = 'ev emi calculator, electric car loan emi, auto loan calculator india, ev finance';
      
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'CARZev EV EMI Loan Calculator',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'description': description
      };
    } else if (currentPage === 'consultation') {
      title = 'Book Free EV Expert Consultation & Subsidy Guide | CARZev';
      description = 'Get personalized advice on choosing the right EV, claiming state FAME-II subsidies, road tax exemptions, and home charger installation.';
      keywords = 'ev expert consultation, electric car subsidy guide, fame 2 subsidy help, home charger installation india';
    } else if (currentPage === 'blog') {
      title = 'CARZev Blog | Latest EV News, Subsidy Updates & Buying Guides';
      description = 'Stay updated on electric vehicle launches in India, FAME-II subsidy guidelines, battery tech breakthroughs, and comprehensive owner reviews.';
      keywords = 'ev news india, electric car launches, fame-ii updates, battery tech news';
      
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        'name': 'CARZev EV Blog',
        'description': description,
        'publisher': {
          '@type': 'Organization',
          'name': 'CARZev'
        }
      };
    } else if (currentPage === 'blog-admin') {
      title = 'EV Blog Management Console | CARZev';
      description = 'Manage CARZev blog articles, publish new electric vehicle guides, edit EV reviews, and customize editorial profiles inside the administrator panel.';
      keywords = 'blog admin';
    } else if (currentPage === 'car-admin') {
      title = 'EV Database Management Console | CARZev';
      description = 'Access the CARZev admin panel to update vehicle specifications, manage on-road price estimates, adjust key specifications, and update pros and cons list.';
      keywords = 'ev database admin, edit electric cars, car specification manager';
    } else if (currentPage === 'privacy') {
      title = 'Privacy Policy | CARZev';
      description = 'Read the privacy policy of CARZev to understand how we collect, use, and protect your personal data and usage data when you browse EV specifications.';
      keywords = 'privacy policy';
    } else if (currentPage === 'terms') {
      title = 'Terms & Conditions | CARZev';
      description = 'Review the terms and conditions for using the CARZev EV discovery platform, including calculators, specification comparisons, and consultation bookings.';
      keywords = 'terms of service';
    } else if (currentPage === 'buying-guide') {
      const guideId = selectedEVId;
      if (guideId === 'under-10-lakh') {
        title = 'Best Electric Vehicles Under 10 Lakh in India 2026 | CARZev';
        description = 'Explore the best electric vehicles and two-wheelers under 10 Lakh in India. Compare ex-showroom prices, certified driving range, battery packs, and features.';
      } else if (guideId === 'under-15-lakh') {
        title = 'Best Electric Cars Under 15 Lakh in India 2026 | CARZev';
        description = 'Compare ex-showroom prices, real-world driving range, safety ratings, and smart features of the best electric cars under 15 Lakh in India for budget buyers.';
      } else if (guideId === 'family') {
        title = 'Best Family Electric Cars & SUVs in India 2026 | CARZev';
        description = 'Find the most spacious and practical electric family cars and SUVs in India. Compare seating capacity, boot space, cabin comfort, and highway safety ratings.';
      } else if (guideId === 'long-range') {
        title = 'Best Long Range Electric Cars in India 2026 | CARZev';
        description = 'Check out the longest range electric cars and SUVs in India. Get detailed insights on battery capacity, fast charging speed, certified range, and real-world range.';
      }
      keywords = `best evs, electric cars india, ev guides, buying guide ${guideId}`;
      
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `What are the best EVs for ${guideId.replace(/-/g, ' ')} in India?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `Here is a curated list of top-performing EV options in India customized for ${guideId.replace(/-/g, ' ')}. Browse comparisons on CARZev.`
            }
          }
        ]
      };
    } else if (currentPage === 'calculator-landing') {
      ev = evModels.find(m => m.id === selectedEVId);
      const calcName = extraData === 'running-cost' ? 'Running Cost' : extraData === 'charging-cost' ? 'Charging Cost' : 'Range';
      if (ev) {
        title = `${ev.brand} ${ev.name} ${calcName} Calculator | CARZev`;
        description = `Estimate real world ${calcName.toLowerCase()} of ${ev.brand} ${ev.name} in India. Interactive tool, specs and dynamic FAQs.`;
        keywords = `${ev.name} calculator, ${ev.name} ${extraData}, ev range calculator, running cost`;
        
        schemaData = {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': `${ev.brand} ${ev.name} ${calcName} Calculator`,
          'applicationCategory': 'BusinessApplication',
          'operatingSystem': 'All',
          'description': description
        };
      }
    }

    // 2. Set document titles and head tags dynamically
    document.title = title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // Dynamic Canonical & OG tags
    const prodOrigin = 'https://carzev.in';
    const currentPath = window.location.pathname;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', prodOrigin + currentPath);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', prodOrigin + currentPath);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta');
      twitterTitle.setAttribute('name', 'twitter:title');
      document.head.appendChild(twitterTitle);
    }
    twitterTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDesc) {
      twitterDesc = document.createElement('meta');
      twitterDesc.setAttribute('name', 'twitter:description');
      document.head.appendChild(twitterDesc);
    }
    twitterDesc.setAttribute('content', description);

    const imageUrl = (ev) ? `${prodOrigin}${ev.image}` : `${prodOrigin}/favicon.png`;
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', imageUrl);

    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (!twitterImage) {
      twitterImage = document.createElement('meta');
      twitterImage.setAttribute('name', 'twitter:image');
      document.head.appendChild(twitterImage);
    }
    twitterImage.setAttribute('content', imageUrl);

    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      document.head.appendChild(ogType);
    }
    ogType.setAttribute('content', currentPage === 'blog' ? 'article' : 'website');

    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      twitterCard = document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', 'summary_large_image');

    // Admin pages noindex
    let noindexMeta = document.querySelector('meta[name="robots"]');
    if (currentPage === 'blog-admin' || currentPage === 'car-admin') {
      if (!noindexMeta) {
        noindexMeta = document.createElement('meta');
        noindexMeta.setAttribute('name', 'robots');
        document.head.appendChild(noindexMeta);
      }
      noindexMeta.setAttribute('content', 'noindex, nofollow');
    } else {
      if (noindexMeta) {
        noindexMeta.remove();
      }
    }

    // 3. Inject / Update JSON-LD structured data script tag
    let schemaScript = document.getElementById('carzev-jsonld-schema');
    if (schemaScript) {
      schemaScript.remove();
    }
    if (schemaData) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('id', 'carzev-jsonld-schema');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.innerHTML = JSON.stringify(schemaData);
      document.head.appendChild(schemaScript);
    }
  }, [currentPage, selectedEVId, extraData]);
  
  // Responsive interactive filters
  const [selectedCategory, setSelectedCategory] = useState<'cars' | 'scooters' | 'bikes' | 'commercial' | 'all' | 'two-wheelers'>('all');
  const [filterBudget, setFilterBudget] = useState<number>(50);
  const [filterNewLaunches, setFilterNewLaunches] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  // Pre-populate Comparison Basket with default models from screenshots
  const [compareList, setCompareList] = useState<EVModel[]>([]);
  const [evList, setEvList] = useState<EVModel[]>(evModels);
  const [blogList, setBlogList] = useState<BlogPost[]>([]);

  // City selection state persisted locally
  const [selectedCity, setSelectedCity] = useState<string>('New Delhi');
  const [loading, setLoading] = useState(true);

  const loadBlogs = () => {
    getBlogPosts()
      .then((data) => {
        setBlogList(data);
      })
      .catch((err) => {
        console.error("Failed to load blog posts:", err);
      });
  };

  useEffect(() => {
    // Read city from storage
    const saved = localStorage.getItem('carzev_city');
    if (saved) {
      setSelectedCity(saved);
    }

    // Initialize current page based on pathname/search params
    const loc = parseLocation();
    setCurrentPage(loc.page);
    setSelectedEVId(loc.selectedEVId);
    setExtraData(loc.extraData);
    if (loc.page === 'compare' && loc.extraData?.compareIds) {
      const items = loc.extraData.compareIds
        .map((id: string) => evModels.find(e => e.id === id))
        .filter(Boolean) as EVModel[];
      setCompareList(items);
    }

    // Fetch EVs and Blogs concurrently from Firestore
    Promise.all([
      getAllEVs(),
      getBlogPosts()
    ])
      .then(([evData, blogData]) => {
        if (evData && evData.length > 0) {
          updateEvModels(evData);
          setEvList([...evData]);
          
          // Re-evaluate location after dynamic EV models load
          const freshLoc = parseLocation();
          setCurrentPage(freshLoc.page);
          setSelectedEVId(freshLoc.selectedEVId);
          setExtraData(freshLoc.extraData);

          if (freshLoc.page === 'compare' && freshLoc.extraData?.compareIds) {
            const items = freshLoc.extraData.compareIds
              .map((id: string) => evData.find(e => e.id === id))
              .filter(Boolean) as EVModel[];
            setCompareList(items);
          }
        }
        if (blogData) {
          setBlogList(blogData);
        }
      })
      .catch((err) => {
        console.error("Failed to load initial data from Firestore, using static backup:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const loc = parseLocation();
      setCurrentPage(loc.page);
      setSelectedEVId(loc.selectedEVId);
      setExtraData(loc.extraData);

      if (loc.page === 'compare' && loc.extraData?.compareIds) {
        const items = loc.extraData.compareIds
          .map((id: string) => evList.find(e => e.id === id))
          .filter(Boolean) as EVModel[];
        setCompareList(items);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [evList]);

  // Global anchor click interceptor for smooth SPA routing
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          e.preventDefault();
          window.history.pushState(null, '', href);
          window.dispatchEvent(new Event('popstate'));
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#111317] text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00C896] mb-4"></div>
        <p className="text-xs uppercase tracking-widest text-[#8b919b] font-semibold">Loading CARZev database...</p>
      </div>
    );
  }


  const handleSetCurrentPage = (page: PageType, extra?: any) => {
    let url = `/${page}`;
    if (page === 'home') url = '/';
    if (page === 'detail') {
      const targetEV = evList.find(m => m.id === selectedEVId);
      url = targetEV ? `/ev/${getBrandSlug(targetEV.brand)}/${targetEV.id}` : `/${selectedEVId}`;
    }
    if (page === 'buying-guide') {
      url = `/${extra || selectedEVId}`;
    }
    if (page === 'calculator-landing') {
      url = `/${extra?.type || 'running-cost'}/${extra?.vehicleId || selectedEVId}`;
    }
    if (page === 'compare') {
      const compareIds = extra?.compareIds || compareList.map(c => c.id);
      if (compareIds.length === 2) {
        url = `/compare/${compareIds[0]}-vs-${compareIds[1]}`;
      } else {
        url = '/compare';
      }
    }
    
    setCurrentPage(page);
    setExtraData(extra);
    if (window.location.pathname !== url) {
      window.history.pushState(null, '', url);
    }
  };

  const handleSelectEV = (evId: string) => {
    setSelectedEVId(evId);
    setCurrentPage('detail');
    
    const targetEV = evList.find(m => m.id === evId);
    const url = targetEV ? `/ev/${getBrandSlug(targetEV.brand)}/${targetEV.id}` : `/${evId}`;
    
    if (window.location.pathname !== url) {
      window.history.pushState(null, '', url);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleAddToCompare = (ev: EVModel) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === ev.id);
      if (exists) {
        // Toggle/remove if exists
        return prev.filter((item) => item.id !== ev.id);
      }
      if (prev.length >= 3) {
        // Reston limit comparison rows to max 3
        alert("Compare grids are optimized to analyze up to 3 cars at once. Please close an existing choice first.");
        return prev;
      }
      return [...prev, ev];
    });
  };

  const handleRemoveFromCompare = (evId: string) => {
    setCompareList((prev) => prev.filter((item) => item.id !== evId));
  };

  const handleAddFromCompareDropdown = (ev: EVModel) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === ev.id);
      if (exists) return prev;
      if (prev.length >= 3) {
        alert("Please remove an existing vehicle first to keep table layout readable.");
        return prev;
      }
      return [...prev, ev];
    });
  };

  // Switch rendering based on active state page
  const renderViewContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomeView
            setCurrentPage={handleSetCurrentPage}
            setSelectedCategory={setSelectedCategory}
            onSelectEV={handleSelectEV}
            setFilterBudget={setFilterBudget}
            setFilterNewLaunches={setFilterNewLaunches}
            onAddToCompare={handleAddToCompare}
            compareList={compareList}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setSelectedBrands={setSelectedBrands}
            allEvs={evList}
          />
        );
      case 'listings':
        return (
          <CategoryView
            setCurrentPage={handleSetCurrentPage}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectEV={handleSelectEV}
            filterBudget={filterBudget}
            setFilterBudget={setFilterBudget}
            filterNewLaunches={filterNewLaunches}
            setFilterNewLaunches={setFilterNewLaunches}
            onAddToCompare={handleAddToCompare}
            compareList={compareList}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            allEvs={evList}
          />
        );
      case 'detail':
        return (
          <DetailView
            evId={selectedEVId}
            setCurrentPage={handleSetCurrentPage}
            onAddToCompare={handleAddToCompare}
            compareList={compareList}
            allEvs={evList}
            selectedCity={selectedCity}
          />
        );
      case 'compare':
        return (
          <CompareView
            compareList={compareList}
            onRemoveFromCompare={handleRemoveFromCompare}
            onAddFromCompareDropdown={handleAddFromCompareDropdown}
            allEvs={evList}
            setCurrentPage={handleSetCurrentPage}
            onSelectEV={handleSelectEV}
          />
        );
      case 'savings-calc':
        return (
          <SavingsView
            setCurrentPage={handleSetCurrentPage}
            onSelectEV={handleSelectEV}
            selectedCity={selectedCity}
            allEvs={evList}
          />
        );
      case 'emi-calc':
        return (
          <EMIView
            setCurrentPage={handleSetCurrentPage}
            onSelectEV={handleSelectEV}
            selectedCity={selectedCity}
            allEvs={evList}
          />
        );
      case 'consultation':
        return (
          <ConsultationView
            setCurrentPage={handleSetCurrentPage}
            selectedCity={selectedCity}
          />
        );
      case 'privacy':
        return (
          <PrivacyView
            setCurrentPage={handleSetCurrentPage}
          />
        );
      case 'terms':
        return (
          <TermsView
            setCurrentPage={handleSetCurrentPage}
          />
        );
      case 'blog':
        return (
          <BlogView
            blogs={blogList}
            setCurrentPage={handleSetCurrentPage}
          />
        );
      case 'blog-admin':
        return (
          <BlogAdminView
            blogs={blogList}
            onDatabaseUpdate={loadBlogs}
            setCurrentPage={handleSetCurrentPage}
          />
        );
      case 'car-admin':
        return (
          <CarAdminView
            allEvs={evList}
            setCurrentPage={handleSetCurrentPage}
            onDatabaseUpdate={() => {
              getAllEVs().then((data) => {
                if (data && data.length > 0) {
                  setEvList([...data]);
                }
              });
            }}
          />
        );
      case 'buying-guide':
        return (
          <BuyingGuideView
            guideId={selectedEVId}
            allEvs={evList}
            setCurrentPage={handleSetCurrentPage}
            onSelectEV={handleSelectEV}
          />
        );
      case 'calculator-landing':
        return (
          <CalculatorLandingView
            calcType={extraData as any || 'running-cost'}
            selectedEvId={selectedEVId}
            allEvs={evList}
            selectedCity={selectedCity}
            setCurrentPage={handleSetCurrentPage}
            onSelectEV={handleSelectEV}
          />
        );
      default:
        return <div>Reviewing parameters...</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111317]">
      {/* Navbar segment */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handleSetCurrentPage}
        setSelectedCategory={setSelectedCategory}
        onSelectEV={handleSelectEV}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        allEvs={evList}
      />

      {/* Scalable view node content */}
      <main className="flex-grow overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderViewContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Compare Shortcut */}
      {compareList.length > 0 && currentPage !== 'compare' && (
        <div className="fixed bottom-8 left-0 w-full flex justify-center z-50 pointer-events-none">
          <div className="animate-bounce pointer-events-auto">
            <button 
              onClick={() => {
                handleSetCurrentPage('compare');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[#00C896] text-[#002116] px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 border border-[#00e3aa] hover:scale-105 transition-transform whitespace-nowrap"
            >
              Compare {compareList.length} Vehicle{compareList.length > 1 ? 's' : ''}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer segment */}
      <Footer 
        setCurrentPage={handleSetCurrentPage}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
}
