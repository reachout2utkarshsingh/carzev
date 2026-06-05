import React, { useState } from 'react';
import { Search, Zap, BatteryCharging, Shield, PenTool, Award, Sparkles } from 'lucide-react';
import { PageType, EVModel } from '../types';
import { evModels } from '../data/evData';
import ThreeDCarCanvas from './ThreeDCarCanvas';
import { motion } from 'motion/react';

interface HomeViewProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedCategory: (category: 'cars' | 'scooters' | 'bikes' | 'commercial' | 'all') => void;
  onSelectEV: (evId: string) => void;
  setFilterBudget: (budget: number) => void;
  setFilterNewLaunches: (newLaunches: boolean) => void;
  onAddToCompare: (ev: EVModel) => void;
  compareList: EVModel[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
};

export default function HomeView({
  setCurrentPage,
  setSelectedCategory,
  onSelectEV,
  setFilterBudget,
  setFilterNewLaunches,
  onAddToCompare,
  compareList
}: HomeViewProps) {
  const [localSearch, setLocalSearch] = useState('');

  // Extract popular items
  const popularEVs = evModels.filter(m => m.popular).slice(0, 4);

  const handlePillClick = (type: 'cars' | 'scooters' | 'bikes' | 'under5' | 'under10' | 'new') => {
    // Reset filters
    setFilterBudget(100);
    setFilterNewLaunches(false);

    if (type === 'cars' || type === 'scooters' || type === 'bikes') {
      setSelectedCategory(type);
    } else if (type === 'under5') {
      setSelectedCategory('all');
      setFilterBudget(5);
    } else if (type === 'under10') {
      setSelectedCategory('all');
      setFilterBudget(10);
    } else if (type === 'new') {
      setSelectedCategory('all');
      setFilterNewLaunches(true);
    }
    setCurrentPage('listings');
  };

  const handleLocalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSearch.trim()) return;
    
    // Redirect to listings and match string
    setSelectedCategory('all');
    setCurrentPage('listings');
  };

  return (
    <div className="bg-[#111317] text-[#e2e2e8]" id="home-view">
      
      {/* 1. Hero Section with Cinematic futuristic neon backdrop */}
      <section className="relative min-h-[640px] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#24262b] pt-16">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Futuristic neon electric automotive concept" 
            className="w-full h-full object-cover object-center opacity-45"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE5dwn_fy_46mfbNd0Wh9j4g3Rw9Xb3tQt51tMu5TmRnlWOuag7tmQ5dTidUdq0FIp0ndRCOVwXid-NpWSSaxjy129nlMieS_JDraSP19RjuyXjvK1JmrObHZSwsAlJy1uHxzd15gkaK32Uyt34wqqrZo4UEluFzy6iPKALBndW4fIf7fsKxVEy5StblDpvcVP-GpEnWWAiQplWais4treuTnxOT_aITAn-rlIMOxcmV3qbI7r0IBysAknWEfOpwoYNzZJ82a54tJ2"
            referrerPolicy="no-referrer"
          />
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#111317]/50 via-[#111317]/85 to-[#111317]"></div>
        </div>

        {/* Hero content container with responsive layout */}
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center px-4 sm:px-6 lg:px-8 w-full py-12">
          {/* Left side: Search & titles */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start gap-6 w-full">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Find Your Perfect <br className="sm:hidden" />
              <span className="text-[#9acbff] bg-clip-text">Electric Vehicle</span>
            </h1>
            <p className="text-[#c0c7d1] text-base sm:text-lg lg:text-xl max-w-2xl font-light leading-relaxed">
              Explore India's most comprehensive database of EVs. Compare full specs side-by-side, calculate real-world battery ranges, and lock down local FAME subsidies.
            </p>

            {/* Screenshot center-themed Search Bar component */}
            <form 
              onSubmit={handleLocalSearchSubmit}
              className="mt-4 bg-white p-1.5 sm:p-2 rounded-full shadow-2xl flex items-center border border-[#414750]/30 w-full max-w-2xl"
            >
              <Search className="w-5 h-5 text-[#8b919b] ml-4 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search any EV, Brand, or Range..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent border-none text-[#1b1c21] font-semibold text-sm sm:text-base px-3 outline-none focus:ring-0 placeholder-[#8b919b]"
                id="hero-search-input"
              />
              <button 
                type="submit"
                className="bg-[#1b6ca8] text-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-full hover:bg-[#114f7d] transition-all flex items-center gap-2"
              >
                Search
              </button>
            </form>

            {/* Quick pills below the search bar */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 mt-4 max-w-md sm:max-w-2xl">
              <button 
                onClick={() => handlePillClick('cars')}
                className="px-5 py-2 bg-[#1a1c20] rounded-full border border-[#414750]/70 text-xs font-bold text-[#c0c7d1] hover:border-[#1b6ca8] hover:text-[#9acbff] transition-all"
              >
                Cars
              </button>
              <button 
                onClick={() => handlePillClick('under5')}
                className="px-5 py-2 bg-[#1a1c20] rounded-full border border-[#414750]/70 text-xs font-bold text-[#c0c7d1] hover:border-[#1b6ca8] hover:text-[#9acbff] transition-all"
              >
                Under 5L
              </button>
              <button 
                onClick={() => handlePillClick('under10')}
                className="px-5 py-2 bg-[#1a1c20] rounded-full border border-[#414750]/70 text-xs font-bold text-[#c0c7d1] hover:border-[#1b6ca8] hover:text-[#9acbff] transition-all"
              >
                Under 10L
              </button>
              <button 
                onClick={() => handlePillClick('new')}
                className="px-5 py-2 bg-[#1b6ca8]/10 rounded-full border border-[#1b6ca8] text-xs font-bold text-[#9acbff] hover:bg-[#1b6ca8] hover:text-white transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                New Launches
              </button>
            </div>
          </div>

          {/* Right side: 3D canvas */}
          <div className="lg:col-span-5 w-full h-[320px] sm:h-[400px] lg:h-[450px] flex items-center justify-center relative overflow-hidden bg-[#1e2025]/30 rounded-3xl border border-[#414750]/20 backdrop-blur-sm shadow-2xl">
            <ThreeDCarCanvas />
          </div>
        </div>
      </section>

      {/* 2. Popular EVs Section matching layout grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-end mb-10"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans">
              Popular EVs
            </h2>
            <p className="text-sm text-[#8b919b] mt-2">
              The absolute high-performance, most viewed electric vehicles in India this week.
            </p>
          </div>
          <button 
            onClick={() => {
              setSelectedCategory('all');
              setCurrentPage('listings');
            }}
            className="text-[#9acbff] hover:text-white text-xs sm:text-sm font-bold transition-all hover:underline"
            id="all-evs-btn"
          >
            View All EVs &rarr;
          </button>
        </motion.div>

        {/* 4 Cards populated with correct image links and tags from template */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {popularEVs.map((ev) => {
            const isAdded = compareList.some(item => item.id === ev.id);
            return (
              <motion.div 
                variants={itemVariants}
                key={ev.id} 
                className="bg-[#1a1c20] rounded-2xl border border-[#414750]/30 overflow-hidden hover:border-[#9acbff]/50 hover:shadow-2xl transition-all duration-300 flex flex-col group"
              >
                
                {/* Card header image layer */}
                <div className="relative aspect-video overflow-hidden bg-[#111317]">
                  
                  {/* Distinctive secondary green battery badge */}
                  <div className="absolute top-3 right-3 bg-[#01c896]/95 text-[#002116] px-2.5 py-1 rounded-lg text-[10px] font-bold z-10 flex items-center gap-1 shadow-md">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>{ev.range} km {ev.rangeType || 'MIDC'}</span>
                  </div>

                  <img 
                    src={ev.image} 
                    alt={ev.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Card description details */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[10px] text-[#8b919b] font-mono tracking-widest uppercase mb-1 leading-none">{ev.brand}</span>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight group-hover:text-[#9acbff] transition-colors">{ev.name}</h3>
                  
                  <div className="flex items-baseline gap-1 mt-4 text-[#9acbff] font-bold text-base sm:text-lg">
                    ₹{ev.priceMin} Lakh <span className="text-[10px] text-[#8b919b] font-normal font-sans ml-1">onwards</span>
                  </div>

                  {/* Standard functional metrics list (Spec previews) */}
                  <div className="mt-4 pt-4 border-t border-[#414750]/20 grid grid-cols-2 gap-2 text-xs text-[#8b919b] font-mono">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-[#8b919b]/80 tracking-wider">Battery</p>
                      <p className="text-[#e2e2e8] mt-0.5">{ev.battery}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-[#8b919b]/80 tracking-wider">Power</p>
                      <p className="text-[#e2e2e8] mt-0.5 truncate">{ev.power}</p>
                    </div>
                  </div>

                  {/* Footer CTAs with Compare inclusion trigger */}
                  <div className="mt-auto pt-6 flex justify-between items-center border-t border-[#414750]/20">
                    <button 
                      onClick={() => onAddToCompare(ev)}
                      className={`text-xs font-bold transition-all px-3 py-1.5 rounded-lg border ${
                        isAdded 
                          ? 'text-[#00C896] border-[#00C896] bg-[#00C896]/10' 
                          : 'text-[#c0c7d1] border-[#414750]/50 hover:text-[#9acbff] hover:border-[#1b6ca8]'
                      }`}
                    >
                      {isAdded ? 'Added' : 'Compare'}
                    </button>
                    <button 
                      onClick={() => onSelectEV(ev.id)}
                      className="bg-[#1b6ca8] text-white px-4 py-2 font-bold text-xs rounded-xl hover:bg-[#114f7d] transition-all"
                    >
                      View Details
                    </button>
                  </div>

                </div>

              </motion.div>
            );
          })}
        </motion.div>

      </section>

      {/* 3. Top Brands Quick exploration segment */}
      <section className="bg-[#1a1c20]/65 border-y border-[#414750]/20 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h3 className="text-xs uppercase font-bold tracking-widest text-[#8b919b] mb-10 font-mono">Explore Top Ecosystem Brands</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto gap-8 items-center justify-center opacity-70">
            <span 
              onClick={() => handlePillClick('cars')} 
              className="text-lg font-extrabold text-[#e2e2e8] hover:text-[#9acbff] cursor-pointer transition-all uppercase tracking-wide px-4"
            >
              TATA
            </span>
            <span 
              onClick={() => handlePillClick('cars')}
              className="text-lg font-extrabold text-[#e2e2e8] hover:text-[#9acbff] cursor-pointer transition-all uppercase tracking-wide px-4"
            >
              HYUNDAI
            </span>
            <span 
              onClick={() => handlePillClick('cars')}
              className="text-lg font-extrabold text-[#e2e2e8] hover:text-[#9acbff] cursor-pointer transition-all uppercase tracking-wide px-4"
            >
              MG MOTOR
            </span>
            <span 
              onClick={() => handlePillClick('cars')}
              className="text-lg font-extrabold text-[#e2e2e8] hover:text-[#9acbff] cursor-pointer transition-all uppercase tracking-wide px-4"
            >
              BYD
            </span>
          </div>
        </motion.div>
      </section>


      {/* 4. Interactive Benefit / Why CARZev stats cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-[#00C896] text-xs font-bold tracking-wider uppercase font-mono bg-[#00C896]/10 px-3 py-1 rounded-full">Our Core Purpose</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mt-3 font-sans">
            Simplifying the Transition to Electric Mobility
          </h2>
          <p className="text-sm text-[#8b919b] mt-2">
            Why thousands of EV buyers trust CARZev calculations daily to finalize their booking order.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          
          <motion.div variants={itemVariants} className="bg-[#1a1c20] p-8 rounded-2xl border border-[#414750]/20 flex flex-col items-start gap-4">
            <div className="p-3.5 bg-[#1b6ca8]/10 rounded-xl text-[#9acbff]">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white font-sans">Unbiased Verifiable Data</h4>
            <p className="text-xs text-[#8b919b] leading-relaxed">
              Every battery capacity, power coefficient, and fast charging velocity is certified against ARAI and homologation press kits. Zero marketing exaggeration.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#1a1c20] p-8 rounded-2xl border border-[#414750]/20 flex flex-col items-start gap-4">
            <div className="p-3.5 bg-[#00c896]/10 rounded-xl text-[#01c896]">
              <PenTool className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white font-sans">Adaptive Compare Engine</h4>
            <p className="text-xs text-[#8b919b] leading-relaxed">
              Pits key technical telemetry of multiple EVs side-by-side. Highlights advantages and winner parameters instantly using our custom comparison algorithm.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#1a1c20] p-8 rounded-2xl border border-[#414750]/20 flex flex-col items-start gap-4">
            <div className="p-3.5 bg-[#ffb86f]/10 rounded-xl text-[#ffb86f]">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white font-sans">Subsidized Pricing Estimates</h4>
            <p className="text-xs text-[#8b919b] leading-relaxed">
              Dynamically calculates vehicle on-road pricing based on state-specific FAME parameters, road tax exclusions, and local registration parameters.
            </p>
          </motion.div>

        </motion.div>

      </section>

      {/* 5. Quick Call to Action / Interactive recommendation widget */}
      <section className="bg-gradient-to-r from-[#172d42] to-[#121c27] py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6"
        >
          <Sparkles className="w-8 h-8 text-[#01c896] animate-pulse" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">Need a Personalized Recommendation?</h2>
          <p className="text-[#c0c7d1] text-xs sm:text-sm max-w-xl leading-relaxed">
            Unsure whether to buy Nexon.ev LR or MG ZS EV? Compare them instantly in our side-by-side grid, or search listings using your strict budget and range goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-md pt-2">
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage('listings');
              }}
              className="flex-1 bg-[#1b6ca8] text-white py-3 px-6 rounded-full font-bold text-xs hover:bg-[#114f7d] transition-all"
            >
              Browse Catalogue
            </button>
            <button 
              onClick={() => setCurrentPage('compare')}
              className="flex-1 bg-transparent text-white border border-[#414750] py-3 px-6 rounded-full font-bold text-xs hover:bg-[#1c1e22] transition-all"
            >
              Open Compare Tool
            </button>
          </div>
        </motion.div>
      </section>
      
    </div>
  );
}
