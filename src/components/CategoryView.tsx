import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, BatteryCharging, Star, Shield, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import { EVModel, PageType } from '../types';
import { evModels } from '../data/evData';

interface CategoryViewProps {
  setCurrentPage: (page: PageType) => void;
  selectedCategory: 'cars' | 'scooters' | 'bikes' | 'commercial' | 'all' | 'two-wheelers';
  setSelectedCategory: (category: 'cars' | 'scooters' | 'bikes' | 'commercial' | 'all' | 'two-wheelers') => void;
  onSelectEV: (evId: string) => void;
  filterBudget: number;
  setFilterBudget: (budget: number) => void;
  filterNewLaunches: boolean;
  setFilterNewLaunches: (newLaunches: boolean) => void;
  onAddToCompare: (ev: EVModel) => void;
  compareList: EVModel[];
}

export default function CategoryView({
  setCurrentPage,
  selectedCategory,
  setSelectedCategory,
  onSelectEV,
  filterBudget,
  setFilterBudget,
  filterNewLaunches,
  setFilterNewLaunches,
  onAddToCompare,
  compareList
}: CategoryViewProps) {
  // Local states for additional sidebar filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRange, setMinRange] = useState<number>(0);
  const [seatingChoice, setSeatingChoice] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<string>('rank'); // 'rank', 'price-asc', 'price-desc', 'range-desc'

  // Extract all existing unique brands for checkbox iteration
  const allBrands = useMemo(() => {
    const brands = evModels.map(ev => ev.brand);
    return Array.from(new Set(brands));
  }, []);

  // Filter items matching sidebar settings
  const filteredEVs = useMemo(() => {
    return evModels.filter((ev) => {
      // 1. Category check
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'two-wheelers') {
          if (ev.category !== 'scooters' && ev.category !== 'bikes') {
            return false;
          }
        } else if (ev.category !== selectedCategory) {
          return false;
        }
      }
      // 2. Budget upper limit check
      if (ev.priceMin > filterBudget) {
        return false;
      }
      // 3. New launch check
      if (filterNewLaunches && !ev.newLaunch) {
        return false;
      }
      // 4. Multiple selected brands check
      if (selectedBrands.length > 0 && !selectedBrands.includes(ev.brand)) {
        return false;
      }
      // 5. Min range check
      if (ev.range < minRange) {
        return false;
      }
      // 6. Seating capacity check
      if (seatingChoice !== 'all' && ev.seatingCapacity !== seatingChoice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort logic
      if (sortBy === 'price-asc') {
        return a.priceMin - b.priceMin;
      } else if (sortBy === 'price-desc') {
        return b.priceMax - a.priceMax;
      } else if (sortBy === 'range-desc') {
        return b.range - a.range;
      }
      // Default: popularity rank / rating desc
      return b.rating - a.rating;
    });
  }, [selectedCategory, filterBudget, filterNewLaunches, selectedBrands, minRange, seatingChoice, sortBy]);

  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setFilterBudget(50);
    setFilterNewLaunches(false);
    setSelectedBrands([]);
    setMinRange(0);
    setSeatingChoice('all');
    setSortBy('rank');
  };

  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="listings-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* View Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#414750]/20 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Electric Vehicle Catalog
            </h1>
            <p className="text-xs text-[#8b919b] mt-1.5 font-mono">
              Home &gt; Listings {selectedCategory !== 'all' && `> ${selectedCategory}`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8b919b] font-bold uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1a1c20] text-xs font-semibold text-white border border-[#414750]/60 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-[#9acbff]"
              id="sort-select"
            >
              <option value="rank">Popularity & Rating</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="range-desc">Battery Range: Longest</option>
            </select>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* A. Left Sidebar Filter Panel */}
          <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/30 h-fit space-y-8" id="sidebar-filters">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#414750]/20">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#8b919b] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#9acbff]" />
                Filters
              </span>
              <button 
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-[#9acbff] hover:text-white hover:underline transition-all"
              >
                Clear All
              </button>
            </div>

            {/* A1. Category Pills Choice */}
            <div>
              <p className="text-xs font-bold text-[#8b919b] uppercase tracking-wider mb-3">Vehicle Type</p>
              <div className="flex flex-col gap-1.5">
                {(['all', 'cars'/*, 'two-wheelers', 'commercial'*/] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full py-2 px-3 text-left text-xs font-bold rounded-xl border transition-all flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-[#1b6ca8]/10 text-[#9acbff] border-[#1b6ca8]'
                        : 'bg-[#111317] text-[#c0c7d1] border-[#414750]/20 hover:border-[#8b919b]'
                    }`}
                  >
                    <span className="capitalize">
                      {cat === 'all' ? 'All Vehicles' : cat}
                    </span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* A2. Price Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-[#8b919b] uppercase tracking-wider">Upper Price Limit</p>
                <span className="text-xs font-extrabold text-[#00C896]" id="filter-budget-display">
                  Under ₹{filterBudget} Lakh
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={filterBudget}
                onChange={(e) => setFilterBudget(Number(e.target.value))}
                className="w-full accent-[#1b6ca8] h-1.5 bg-[#111317] rounded-all cursor-pointer"
                id="budget-range-input"
              />
              <div className="flex justify-between text-[10px] text-[#8b919b] font-mono mt-1">
                <span>₹1 Lakh</span>
                <span>₹50 Lakh+</span>
              </div>
            </div>

            {/* A3. Brand list checkboxes */}
            <div>
              <p className="text-xs font-bold text-[#8b919b] uppercase tracking-wider mb-3">Filter by Brand</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2" id="brand-checkboxes-list">
                {allBrands.map((brand) => {
                  const isChecked = selectedBrands.includes(brand);
                  return (
                    <label 
                      key={brand}
                      className="flex items-center gap-2.5 text-xs text-[#c0c7d1] hover:text-white cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBrandToggle(brand)}
                        className="w-4 h-4 rounded-md border-[#414750] bg-[#111317] text-[#1b6ca8] focus:ring-1 focus:ring-[#9acbff]"
                      />
                      <span>{brand}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* A4. Minimum Range Target */}
            <div>
              <p className="text-xs font-bold text-[#8b919b] uppercase tracking-wider mb-3">Min Certified Range</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[0, 100, 300, 450].map((rng) => (
                  <button
                    key={rng}
                    onClick={() => setMinRange(rng)}
                    className={`py-2 px-1 text-center text-xs font-semibold rounded-xl border transition-all ${
                      minRange === rng
                        ? 'bg-[#1b6ca8] border-[#9acbff] text-white'
                        : 'bg-[#111317] text-[#c0c7d1] border-[#414750]/30 hover:border-[#8b919b]'
                    }`}
                  >
                    {rng === 0 ? 'Any Range' : `${rng}+ km`}
                  </button>
                ))}
              </div>
            </div>

            {/* A5. Seating Capacity Selectors */}
            <div>
              <p className="text-xs font-bold text-[#8b919b] uppercase tracking-wider mb-3">Seating Capacity</p>
              <div className="grid grid-cols-3 gap-1.5">
                {([ 'all', 2, 5 ] as const).map((seat) => (
                  <button
                    key={seat}
                    onClick={() => setSeatingChoice(seat === 'all' ? 'all' : Number(seat))}
                    className={`py-2 text-center text-xs font-semibold rounded-xl border transition-all ${
                      seatingChoice === seat
                        ? 'bg-[#1b6ca8] border-[#9acbff] text-white'
                        : 'bg-[#111317] text-[#c0c7d1] border-[#414750]/30 hover:border-[#8b919b]'
                    }`}
                  >
                    {seat === 'all' ? 'All' : `${seat} Seater`}
                  </button>
                ))}
              </div>
            </div>

            {/* A6. New Launch Filter Pill */}
            <div className="pt-4 border-t border-[#414750]/20">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-[#c0c7d1]">Show only New Launches</span>
                <input
                  type="checkbox"
                  checked={filterNewLaunches}
                  onChange={(e) => setFilterNewLaunches(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1b6ca8]"
                />
              </label>
            </div>

          </div>

          {/* B. Right Grid Results List */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Status overview text lines */}
            <div className="flex justify-between items-center text-xs text-[#8b919b] font-mono">
              <p>Found <span className="text-white font-bold">{filteredEVs.length}</span> Electric Vehicles match criteria</p>
              {(selectedBrands.length > 0 || minRange > 0 || seatingChoice !== 'all' || filterBudget < 50 || selectedCategory !== 'all') && (
                <button 
                  onClick={handleClearFilters}
                  className="text-[#9acbff] hover:underline cursor-pointer"
                >
                  Reset Active Filters
                </button>
              )}
            </div>

            {filteredEVs.length === 0 ? (
              <div 
                className="bg-[#1a1c20] rounded-2xl border border-[#414750]/20 p-12 text-center flex flex-col items-center justify-center gap-4"
                id="no-match-alert"
              >
                <p className="text-base font-bold text-[#c0c7d1]">No electric vehicles match your exact filters.</p>
                <p className="text-xs text-[#8b919b] max-w-sm">Try increasing your price slider limit, clearing specific brand selections, or viewing all vehicle categories.</p>
                <button 
                  onClick={handleClearFilters}
                  className="bg-[#1b6ca8] text-white py-2 px-6 rounded-xl text-xs font-bold hover:bg-[#114f7d] transition-all"
                >
                  Clear Sidebar Settings
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="listings-grid">
                {filteredEVs.map((ev) => {
                  const isAdded = compareList.some(item => item.id === ev.id);
                  return (
                    <div 
                      key={ev.id} 
                      className="bg-[#1a1c20] rounded-2xl border border-[#414750]/30 overflow-hidden hover:border-[#9acbff]/50 hover:shadow-2xl transition-all duration-300 flex flex-col group"
                    >
                      {/* Image Area */}
                      <div className="relative aspect-video overflow-hidden bg-[#111317]">
                        
                        <div className="absolute top-3 right-3 bg-[#01c896]/95 text-[#002116] px-2.5 py-1 rounded-lg text-[10px] font-bold z-10 flex items-center gap-1 shadow-md">
                          <BatteryCharging className="w-3.5 h-3.5" />
                          <span>{ev.range} km</span>
                        </div>

                        {ev.newLaunch && (
                          <div className="absolute top-3 left-3 bg-[#1b6ca8] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold z-10 flex items-center gap-0.5 shadow-md uppercase">
                            New
                          </div>
                        )}

                        <img 
                          src={ev.image} 
                          alt={ev.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info Area */}
                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-[10px] text-[#8b919b] font-mono tracking-widest uppercase mb-1 leading-none">{ev.brand}</span>
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#9acbff] transition-colors leading-tight">{ev.name}</h3>

                        <div className="flex items-baseline gap-1 mt-3 text-[#9acbff] font-bold text-base sm:text-lg">
                          ₹{ev.priceMin} - ₹{ev.priceMax || ev.priceMin} Lakh
                        </div>

                        {/* Spec parameters */}
                        <div className="mt-4 pt-4 border-t border-[#414750]/20 grid grid-cols-2 gap-2 text-xs text-[#8b919b] font-mono">
                          <div>
                            <p className="text-[9px] uppercase font-bold text-[#8b919b]/80 tracking-wider">Battery</p>
                            <p className="text-[#e2e2e8] mt-0.5 truncate">{ev.battery}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-[#8b919b]/80 tracking-wider">Charge Speed</p>
                            <p className="text-[#e2e2e8] mt-0.5 truncate">{ev.chargingTime}</p>
                          </div>
                        </div>

                        {/* CTA button bars */}
                        <div className="mt-auto pt-6 flex justify-between items-center border-t border-[#414750]/20 gap-2">
                          <button 
                            onClick={() => onAddToCompare(ev)}
                            className={`flex-1 text-xs font-bold transition-all py-2 rounded-xl border ${
                              isAdded 
                                ? 'text-[#00C896] border-[#00C896] bg-[#00C896]/10' 
                                : 'text-[#c0c7d1] border-[#414750]/50 hover:text-[#9acbff] hover:border-[#1b6ca8]'
                            }`}
                          >
                            {isAdded ? 'Added' : 'Compare'}
                          </button>
                          <button 
                            onClick={() => onSelectEV(ev.id)}
                            className="flex-1 bg-[#1b6ca8] text-white py-2 font-bold text-xs rounded-xl hover:bg-[#114f7d] transition-all text-center"
                          >
                            View Details
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
