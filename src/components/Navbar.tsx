import React, { useState, useEffect } from 'react';
import { Search, MapPin, Menu, X, Landmark, Percent, ChevronDown, Coins, Calculator } from 'lucide-react';
import { PageType, EVModel } from '../types';
import { evModels } from '../data/evData';

interface NavbarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  setSelectedCategory: (category: 'cars' | 'scooters' | 'bikes' | 'commercial' | 'all' | 'two-wheelers') => void;
  onSelectEV: (evId: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CITIES = ["New Delhi", "Mumbai", "Bengaluru", "Pune", "Hyderabad", "Chennai"];

export default function Navbar({
  currentPage,
  setCurrentPage,
  setSelectedCategory,
  onSelectEV,
  selectedCity,
  setSelectedCity,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setSelectedCategory('all');
    setCurrentPage('listings');
  };

  // Filter recommendations based on search
  const suggestions = searchQuery.trim()
    ? evModels.filter((ev) =>
        ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSuggestionClick = (evId: string) => {
    onSelectEV(evId);
    setSearchQuery('');
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  };

  const handleNavClick = (page: PageType, category?: 'cars' | 'scooters' | 'bikes' | 'commercial' | 'two-wheelers') => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory('all');
    }
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setToolsOpen(false);
  };

  return (
    <>
      <nav className="bg-[#111317] border-b border-[#414750]/30 h-[64px] fixed top-0 left-0 w-full z-50 shadow-sm" id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Logo & Main nav */}
          <div className="flex items-center gap-8">
            <span 
              onClick={() => handleNavClick('home')}
              className="text-2xl font-bold tracking-tight text-[#9acbff] cursor-pointer hover:opacity-85 transition-opacity font-headline-md font-sans"
              id="nav-logo"
            >
              CAR<span className="text-[#00C896]">Z</span>ev
            </span>
            
            <div className="hidden md:flex gap-6 items-center">
              <span
                onClick={() => handleNavClick('listings', 'cars')}
                className={`cursor-pointer text-sm font-semibold tracking-wide transition-colors ${
                  currentPage === 'listings' && searchQuery === '' ? 'text-[#9acbff]' : 'text-[#c0c7d1] hover:text-[#9acbff]'
                }`}
                id="link-cars"
              >
                Electric Cars
              </span>
              {/*
              <span
                onClick={() => handleNavClick('listings', 'two-wheelers')}
                className={`cursor-pointer text-sm font-semibold tracking-wide transition-colors \${
                  currentPage === 'listings' && searchQuery === '' ? 'text-[#9acbff]' : 'text-[#c0c7d1] hover:text-[#9acbff]'
                }`}
                id="link-two-wheelers"
              >
                Scooters & Bikes
              </span>
              <span
                onClick={() => handleNavClick('listings', 'commercial')}
                className={`cursor-pointer text-sm font-semibold tracking-wide transition-colors \${
                  currentPage === 'listings' ? 'text-[#9acbff]' : 'text-[#c0c7d1] hover:text-[#9acbff]'
                }`}
                id="link-commercial"
              >
                Commercial
              </span>
              */}
              <span
                onClick={() => handleNavClick('compare')}
                className={`cursor-pointer text-sm font-semibold tracking-wide transition-colors ${
                  currentPage === 'compare' ? 'text-[#9acbff]' : 'text-[#c0c7d1] hover:text-[#9acbff]'
                }`}
                id="link-compare"
              >
                Compare
              </span>
              <span
                onClick={() => handleNavClick('consultation')}
                className={`cursor-pointer text-sm font-semibold tracking-wide transition-colors ${
                  currentPage === 'consultation' ? 'text-[#9acbff]' : 'text-[#c0c7d1] hover:text-[#9acbff]'
                }`}
                id="link-consultation"
              >
                Consultation
              </span>
              
              {/* Interactive Tools dropdown panel */}
              <div 
                className="relative cursor-pointer group py-2 flex items-center"
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
                id="nav-dropdown-tools"
              >
                <span className="text-sm font-semibold tracking-wide text-[#c0c7d1] hover:text-[#9acbff] transition-colors flex items-center gap-1">
                  Tools
                  <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform text-[#8b919b]" />
                </span>
                
                {toolsOpen && (
                  <div className="absolute top-full left-0 pt-2.5 z-50 animate-fade-in w-52">
                    <div className="bg-[#1e2024] border border-[#414750]/50 rounded-xl shadow-2xl py-2 w-full">
                      <div 
                        onClick={() => handleNavClick('savings-calc')}
                        className="px-4 py-3 hover:bg-[#282a2e] text-xs text-[#c0c7d1] hover:text-white font-bold transition-colors flex items-center gap-2.5 cursor-pointer"
                      >
                        <Coins className="w-4 h-4 text-[#00C896]" />
                        Calculate EV Savings
                      </div>
                      <div 
                        onClick={() => handleNavClick('emi-calc')}
                        className="px-4 py-3 hover:bg-[#282a2e] text-xs text-[#c0c7d1] hover:text-white font-bold transition-colors flex items-center gap-2.5 border-t border-[#414750]/15 cursor-pointer"
                      >
                        <Calculator className="w-4 h-4 text-[#9acbff]" />
                        Calculate EMI
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/*
              <a
                href="#footer"
                className="cursor-pointer text-sm font-semibold tracking-wide text-[#c0c7d1] hover:text-[#9acbff] transition-colors"
                id="link-whats-new"
              >
                What's New
              </a>
              */}
            </div>
          </div>

          {/* Right items: Search & City */}
          <div className="flex items-center gap-4">
            
            <button 
              onClick={() => setShowCityModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#c0c7d1] hover:text-[#9acbff] transition-colors bg-[#1a1c20] py-1.5 px-3 rounded-full border border-[#414750]/30"
              id="city-selector-btn"
            >
              <MapPin className="w-4 h-4 text-[#00C896]" />
              <span className="text-xs uppercase tracking-wide">{selectedCity}</span>
            </button>

            {/* Quick Autocomplete Search */}
            <div className="relative hidden md:block w-56 lg:w-72">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search any EV, Brand or SUV..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-9 pr-4 py-1.5 bg-[#1a1c20] text-sm text-[#e2e2e8] placeholder-[#8b919b] border border-[#414750]/55 rounded-full focus:outline-none focus:border-[#9acbff] focus:ring-1 focus:ring-[#9acbff]/50 transition-all text-xs"
                  id="nav-search-input"
                />
                <Search className="w-4 h-4 text-[#8b919b] absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b919b] hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </form>
              
              {/* Autocomplete dropdown list */}
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  className="absolute left-0 mt-2 w-full bg-[#1e2024] border border-[#414750] rounded-xl shadow-2xl overflow-hidden z-50 text-[#e2e2e8]"
                  id="search-suggestions-dropdown"
                >
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {suggestions.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => handleSuggestionClick(ev.id)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#282a2e] cursor-pointer transition-colors border-b border-[#414750]/20 last:border-0"
                      >
                        <img 
                          src={ev.image} 
                          alt={ev.name} 
                          className="w-10 h-7 object-cover rounded-md bg-[#111317]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#8b919b] tracking-wider uppercase font-medium leading-none">{ev.brand}</p>
                          <p className="text-sm text-[#e2e2e8] font-semibold truncate mt-0.5">{ev.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#00C896] font-bold">{ev.range} km</p>
                          <p className="text-[10px] text-[#8b919b]">Min ₹{ev.priceMin}L</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu and search toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <button 
                onClick={() => setShowCityModal(true)}
                className="flex items-center justify-center p-1.5 rounded-full bg-[#1a1c20] text-[#c0c7d1] hover:text-[#9acbff]"
              >
                <MapPin className="w-4 h-4 text-[#00C896]" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-full bg-[#1a1c20] text-[#c0c7d1]"
                id="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

        </div>

        {/* Mobile menu dropdown drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#111317] border-b border-[#414750]/50 absolute top-[64px] left-0 w-full z-40 transition-all p-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search EVs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#1a1c20] text-sm text-[#e2e2e8] placeholder-[#8b919b] border border-[#414750]/55 rounded-full"
                />
                <Search className="w-4 h-4 text-[#8b919b] absolute left-3 top-1/2 -translate-y-1/2" />
              </form>
              {searchQuery && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#1e2024] border border-[#414750] rounded-xl z-50">
                  {suggestions.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => handleSuggestionClick(ev.id)}
                      className="flex items-center justify-between px-4 py-2 hover:bg-[#282a2e] cursor-pointer text-sm"
                    >
                      <span>{ev.brand} {ev.name}</span>
                      <span className="text-[#00C896] font-bold text-xs">{ev.range} km</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleNavClick('listings', 'cars')}
                className="text-left font-medium p-3 bg-[#1a1c20] rounded-xl hover:bg-[#282a2e] text-[#e2e2e8]"
              >
                Electric Cars
              </button>
              {/*
              <button
                onClick={() => handleNavClick('listings', 'two-wheelers')}
                className="text-left font-medium p-3 bg-[#1a1c20] rounded-xl hover:bg-[#282a2e] text-[#e2e2e8] col-span-1"
              >
                Scooters & Bikes
              </button>
              <button
                onClick={() => handleNavClick('listings', 'commercial')}
                className="text-left font-medium p-3 bg-[#1a1c20] rounded-xl hover:bg-[#282a2e] text-[#e2e2e8]"
              >
                Commercial
              </button>
              */}
              <button
                onClick={() => handleNavClick('compare')}
                className="text-left font-medium p-3 bg-[#1a1c20] rounded-xl hover:bg-[#282a2e] text-[#e2e2e8]"
              >
                Compare
              </button>
              <button
                onClick={() => handleNavClick('consultation')}
                className="text-left font-medium p-3 bg-[#1a1c20] rounded-xl hover:bg-[#282a2e] text-[#e2e2e8] col-span-2"
              >
                Consultation
              </button>
              
              {/* Mobile Calculators */}
              <button
                onClick={() => handleNavClick('savings-calc')}
                className="col-span-1 text-left text-xs font-bold p-3 bg-[#00C896]/10 border border-[#00C896]/20 text-[#00C896] rounded-xl"
              >
                Calculate EV Savings
              </button>
              <button
                onClick={() => handleNavClick('emi-calc')}
                className="col-span-1 text-left text-xs font-bold p-3 bg-[#9acbff]/10 border border-[#9acbff]/20 text-[#9acbff] rounded-xl"
              >
                Calculate EMI
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* City Dialog Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="city-selector-modal">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowCityModal(false)}
          ></div>
          
          <div className="bg-[#1a1c20] border border-[#414750] w-full max-w-md rounded-2xl overflow-hidden relative z-10 shadow-2xl animate-fade-in p-6">
            <h3 className="text-lg font-bold text-[#e2e2e8] tracking-tight">Select Your City</h3>
            <p className="text-xs text-[#8b919b] mt-1 mb-4">Pricing and local RTO subsidies will update to your selection automatically.</p>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    localStorage.setItem('carzev_city', city);
                    setShowCityModal(false);
                  }}
                  className={`py-3 px-4 text-sm rounded-xl font-semibold border transition-all text-center ${
                    selectedCity === city
                      ? 'bg-[#1b6ca8] text-white border-[#9acbff]'
                      : 'bg-[#111317] text-[#c0c7d1] border-[#414750]/40 hover:bg-[#1c1e22] hover:border-[#8b919b]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCityModal(false)}
              className="mt-6 w-full py-2.5 text-center text-sm font-bold text-[#c0c7d1] bg-[#111317] hover:bg-[#282a2e] rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
