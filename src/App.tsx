import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import CategoryView from './components/CategoryView';
import DetailView from './components/DetailView';
import CompareView from './components/CompareView';
import EMIView from './components/EMIView';
import SavingsView from './components/SavingsView';
import { PageType, EVModel } from './types';
import { evModels, updateEvModels } from './data/evData';
import { getAllEVs } from './lib/evService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedEVId, setSelectedEVId] = useState<string>('nexon-ev');
  
  // Responsive interactive filters
  const [selectedCategory, setSelectedCategory] = useState<'cars' | 'scooters' | 'bikes' | 'commercial' | 'all' | 'two-wheelers'>('all');
  const [filterBudget, setFilterBudget] = useState<number>(50);
  const [filterNewLaunches, setFilterNewLaunches] = useState<boolean>(false);
  
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
        const defaultNexon = evModels.find(e => e.id === 'nexon-ev');
        const defaultMG = evModels.find(e => e.id === 'mg-zs-ev');
        const defaultCreta = evModels.find(e => e.id === 'creta-electric');
        
        const defaults: EVModel[] = [];
        if (defaultNexon) defaults.push(defaultNexon);
        if (defaultMG) defaults.push(defaultMG);
        if (defaultCreta) defaults.push(defaultCreta);
        setCompareList(defaults);
        
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
      />

      {/* Scalable view node content */}
      <main className="flex-grow">
        {renderViewContent()}
      </main>

      {/* Footer segment */}
      <Footer 
        setCurrentPage={setCurrentPage}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
}
