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
import { PageType, EVModel } from './types';
import { evModels, updateEvModels } from './data/evData';
import { getAllEVs } from './lib/evService';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedEVId, setSelectedEVId] = useState<string>('nexon-ev');

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);
  
  // Responsive interactive filters
  const [selectedCategory, setSelectedCategory] = useState<'cars' | 'scooters' | 'bikes' | 'commercial' | 'all' | 'two-wheelers'>('all');
  const [filterBudget, setFilterBudget] = useState<number>(50);
  const [filterNewLaunches, setFilterNewLaunches] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  // Pre-populate Comparison Basket with default models from screenshots
  const [compareList, setCompareList] = useState<EVModel[]>([]);

  // City selection state persisted locally
  const [selectedCity, setSelectedCity] = useState<string>('New Delhi');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read city from storage
    const saved = localStorage.getItem('carzev_city');
    if (saved) {
      setSelectedCity(saved);
    }

    // Fetch EVs from Firestore
    getAllEVs()
      .then((data) => {
        if (data && data.length > 0) {
          updateEvModels(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load EVs from Firestore, using static backup:", err);
      })
      .finally(() => {
        // Pre-populate comparison list from whichever data is current
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
          />
        );
      case 'detail':
        return (
          <DetailView
            evId={selectedEVId}
            setCurrentPage={setCurrentPage}
            onAddToCompare={handleAddToCompare}
            compareList={compareList}
            allEvs={evModels}
            selectedCity={selectedCity}
          />
        );
      case 'compare':
        return (
          <CompareView
            compareList={compareList}
            onRemoveFromCompare={handleRemoveFromCompare}
            onAddFromCompareDropdown={handleAddFromCompareDropdown}
            allEvs={evModels}
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
          />
        );
      case 'emi-calc':
        return (
          <EMIView
            setCurrentPage={setCurrentPage}
            onSelectEV={handleSelectEV}
            selectedCity={selectedCity}
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
