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
import { PageType, EVModel, BlogPost } from './types';
import { evModels, updateEvModels } from './data/evData';
import { getAllEVs } from './lib/evService';
import { getBlogPosts } from './lib/blogService';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedEVId, setSelectedEVId] = useState<string>('nexon-ev');

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

    if (currentPage === 'home') {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'CARZev',
        'url': 'https://carzev.com/',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://carzev.com/?page=listings&q={search_term_string}',
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
        'url': 'https://carzev.com/?page=listings',
        'hasPart': evModels.slice(0, 10).map((ev) => ({
          '@type': 'Product',
          'name': ev.name,
          'brand': {
            '@type': 'Brand',
            'name': ev.brand
          },
          'image': `https://carzev.com${ev.image}`,
          'offers': {
            '@type': 'AggregateOffer',
            'lowPrice': ev.priceMin * 100000,
            'highPrice': ev.priceMax * 100000,
            'priceCurrency': 'INR'
          }
        }))
      };
    } else if (currentPage === 'detail') {
      const ev = evModels.find(m => m.id === selectedEVId);
      if (ev) {
        title = `${ev.brand} ${ev.name} Price in India, Range, Specs & Reviews | CARZev`;
        description = `Check out ${ev.brand} ${ev.name} features, certified ${ev.range} km ${ev.rangeType} range, ${ev.battery} battery, charging options, and on-road price starting at ₹${ev.priceMin} Lakh.`;
        keywords = `${ev.name} price, ${ev.brand} ${ev.name} range, ${ev.name} specs, ${ev.name} electric car India`;
        
        schemaData = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': `${ev.brand} ${ev.name}`,
          'image': `https://carzev.com${ev.image}`,
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
      title = 'Compare Electric Vehicles Side-by-Side | Specs & Range | CARZev';
      description = 'Compare battery capacity, range, charging times, power, and state subsidies of electric cars in India to pick your best EV.';
      keywords = 'compare electric cars, ev comparison tool, nexon ev vs mg zs ev, curvv ev vs punch ev';
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
    } else if (currentPage === 'blog' || currentPage === 'blog-admin') {
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
    } else if (currentPage === 'car-admin') {
      title = 'EV Database Management Console | CARZev';
      description = 'Manage vehicle entries, technical specifications, pros, cons, and pictures in the CARZev EV database.';
      keywords = 'ev database admin, edit electric cars, car specification manager';
    }

    // 2. Set document title, description, and keywords
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
  }, [currentPage, selectedEVId]);
  
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

    // Check query parameters for blog or blog-admin routing
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (pageParam === 'blog-admin') {
      setCurrentPage('blog-admin');
    } else if (pageParam === 'blog') {
      setCurrentPage('blog');
    } else if (pageParam === 'car-admin') {
      setCurrentPage('car-admin');
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
        }
        if (blogData) {
          setBlogList(blogData);
        }
      })
      .catch((err) => {
        console.error("Failed to load initial data from Firestore, using static backup:", err);
      })
      .finally(() => {
        setCompareList([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#111317] text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00C896] mb-4"></div>
        <p className="text-xs uppercase tracking-widest text-[#8b919b] font-semibold">Loading CARZev database...</p>
      </div>
    );
  }


  const handleSelectEV = (evId: string) => {
    setSelectedEVId(evId);
    setCurrentPage('detail');
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
            setCurrentPage={setCurrentPage}
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
            setCurrentPage={setCurrentPage}
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
            setCurrentPage={setCurrentPage}
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
            setCurrentPage={setCurrentPage}
            onSelectEV={handleSelectEV}
          />
        );
      case 'savings-calc':
        return (
          <SavingsView
            setCurrentPage={setCurrentPage}
            onSelectEV={handleSelectEV}
            selectedCity={selectedCity}
            allEvs={evList}
          />
        );
      case 'emi-calc':
        return (
          <EMIView
            setCurrentPage={setCurrentPage}
            onSelectEV={handleSelectEV}
            selectedCity={selectedCity}
            allEvs={evList}
          />
        );
      case 'consultation':
        return (
          <ConsultationView
            setCurrentPage={setCurrentPage}
            selectedCity={selectedCity}
          />
        );
      case 'privacy':
        return (
          <PrivacyView
            setCurrentPage={setCurrentPage}
          />
        );
      case 'terms':
        return (
          <TermsView
            setCurrentPage={setCurrentPage}
          />
        );
      case 'blog':
        return (
          <BlogView
            blogs={blogList}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'blog-admin':
        return (
          <BlogAdminView
            blogs={blogList}
            onDatabaseUpdate={loadBlogs}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'car-admin':
        return (
          <CarAdminView
            allEvs={evList}
            setCurrentPage={setCurrentPage}
            onDatabaseUpdate={() => {
              getAllEVs().then((data) => {
                if (data && data.length > 0) {
                  setEvList([...data]);
                }
              });
            }}
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
        setCurrentPage={setCurrentPage}
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
                setCurrentPage('compare');
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
        setCurrentPage={setCurrentPage}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
}
