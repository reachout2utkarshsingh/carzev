import React, { useState, useRef, useEffect } from 'react';
import { Search, Zap, BatteryCharging, Shield, PenTool, Award, Sparkles } from 'lucide-react';
import { PageType, EVModel } from '../types';
import { evModels } from '../data/evData';
import CanvasImageSequence from './CanvasImageSequence';
import { motion, useScroll, useSpring } from 'motion/react';

interface HomeViewProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedCategory: (category: 'cars' | 'scooters' | 'bikes' | 'commercial' | 'all' | 'two-wheelers') => void;
  onSelectEV: (evId: string) => void;
  setFilterBudget: (budget: number) => void;
  setFilterNewLaunches: (newLaunches: boolean) => void;
  onAddToCompare: (ev: EVModel) => void;
  compareList: EVModel[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedBrands: (brands: string[]) => void;
  allEvs: EVModel[];
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
  compareList,
  searchQuery,
  setSearchQuery,
  setSelectedBrands,
  allEvs
}: HomeViewProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  // Dynamic list of unique brands
  const allBrands = React.useMemo(() => {
    const brands = allEvs.map(ev => ev.brand);
    return Array.from(new Set(brands)).sort((a, b) => a.localeCompare(b));
  }, [allEvs]);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 90,
    restDelta: 0.001
  });



  // Sync local search state with global state if changed
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Extract popular items
  const popularEVs = allEvs.filter(m => m.popular).slice(0, 4);

  const handlePillClick = (type: 'cars' | 'scooters' | 'bikes' | 'under5' | 'under10' | 'new') => {
    // Reset filters
    setFilterBudget(100);
    setFilterNewLaunches(false);
    setSelectedBrands([]);
    setSearchQuery('');

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

  const handleBrandClick = (brand: string) => {
    setSelectedCategory('all');
    setSelectedBrands([brand]);
    setSearchQuery('');
    setFilterBudget(100);
    setFilterNewLaunches(false);
    setCurrentPage('listings');
  };

  const handleLocalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Redirect to listings and match string
    setSelectedCategory('all');
    setSelectedBrands([]); // Clear brands filter on free search
    setSearchQuery(localSearch.trim());
    setCurrentPage('listings');
  };

  return (
    <div ref={containerRef} className="text-[#e2e2e8] relative min-h-[400vh]" id="home-view">
      
      {/* Fixed Background Canvas */}
      <div className="fixed inset-0 z-0 h-screen w-full bg-black">
        <CanvasImageSequence progress={smoothProgress} />
      </div>
      
      {/* Foreground Content wrapper */}
      <div className="relative z-10 w-full flex flex-col">
        
        {/* 1. Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-20">
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-6 w-full pt-12">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-tight font-sans drop-shadow-2xl">
              Find Your Perfect <br className="hidden sm:block" />
              <span className="text-[#00C896] bg-clip-text">Electric Vehicle</span>
            </h1>
            <p className="text-[#c0c7d1] text-sm sm:text-lg lg:text-xl max-w-2xl font-light leading-relaxed drop-shadow-md px-2">
              Explore India's most comprehensive database of EVs. Compare full specs side-by-side, calculate real-world battery ranges, and lock down local FAME subsidies.
            </p>

            {/* Search Bar component */}
            <form 
              onSubmit={handleLocalSearchSubmit}
              className="mt-6 bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-full shadow-[0_0_30px_rgba(0,200,150,0.2)] flex items-center border border-white/20 w-full max-w-2xl"
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
                className="bg-[#00C896] text-black font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-full hover:bg-white transition-all flex items-center gap-2"
              >
                Search
              </button>
            </form>

            {/* Quick pills below the search bar */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 max-w-md sm:max-w-2xl">
              <button 
                onClick={() => handlePillClick('cars')}
                className="px-5 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/20 text-xs font-bold text-white hover:border-[#00C896] hover:text-[#00C896] transition-all"
              >
                Cars
              </button>
              <button 
                onClick={() => handlePillClick('under5')}
                className="px-5 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/20 text-xs font-bold text-white hover:border-[#00C896] hover:text-[#00C896] transition-all"
              >
                Under 5L
              </button>
              <button 
                onClick={() => handlePillClick('under10')}
                className="px-5 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/20 text-xs font-bold text-white hover:border-[#00C896] hover:text-[#00C896] transition-all"
              >
                Under 10L
              </button>
              <button 
                onClick={() => handlePillClick('new')}
                className="px-5 py-2 bg-[#00C896]/20 backdrop-blur-sm rounded-full border border-[#00C896] text-xs font-bold text-[#00C896] hover:bg-[#00C896] hover:text-black transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,200,150,0.3)]"
              >
                <Zap className="w-3.5 h-3.5" />
                New
              </button>
            </div>
            
            <div className="mt-16 animate-bounce text-white/50 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Scroll to Explore</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* 2. Popular EVs Section matching layout grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[80vh] flex flex-col justify-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-end mb-10"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans drop-shadow-lg">
                Popular EVs
              </h2>
              <p className="text-sm text-white/80 mt-2 font-medium drop-shadow-md">
                The absolute high-performance, most viewed electric vehicles in India this week.
              </p>
            </div>
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage('listings');
              }}
              className="text-[#00C896] hover:text-white text-xs sm:text-sm font-bold transition-all hover:underline"
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
                  className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-[#00C896]/50 hover:shadow-[0_0_30px_rgba(0,200,150,0.15)] transition-all duration-300 flex flex-col group cursor-pointer"
                  onClick={() => onSelectEV(ev.id)}
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
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Card description details */}
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[10px] text-[#00C896] font-mono tracking-widest uppercase mb-1 leading-none">{ev.brand}</span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight group-hover:text-[#00C896] transition-colors">{ev.name}</h3>
                    
                    <div className="flex items-baseline gap-1 mt-4 text-white font-bold text-base sm:text-lg">
                      ₹{ev.priceMin} Lakh <span className="text-[10px] text-white/50 font-normal font-sans ml-1">onwards</span>
                    </div>

                    {/* Standard functional metrics list (Spec previews) */}
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-white/70 font-mono">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Battery</p>
                        <p className="text-[#e2e2e8] mt-0.5">{ev.battery}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Power</p>
                        <p className="text-[#e2e2e8] mt-0.5 truncate">{ev.power}</p>
                      </div>
                    </div>

                    {/* Footer CTAs with Compare inclusion trigger */}
                    <div className="mt-auto pt-6 flex justify-between items-center border-t border-white/10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCompare(ev);
                        }}
                        className={`text-xs font-bold transition-all px-3 py-1.5 rounded-lg border ${
                          isAdded 
                            ? 'text-[#00C896] border-[#00C896] bg-[#00C896]/10' 
                            : 'text-white/70 border-white/30 hover:text-white hover:border-[#00C896]'
                        }`}
                      >
                        {isAdded ? 'Added' : 'Compare'}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEV(ev.id);
                        }}
                        className="bg-white/10 text-white border border-white/20 px-4 py-2 font-bold text-xs rounded-xl hover:bg-[#00C896] hover:text-black hover:border-[#00C896] transition-all"
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
        <section className="bg-black/50 backdrop-blur-md border-y border-white/10 py-16 min-h-[50vh] flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#00C896] mb-10 font-mono drop-shadow-md">Explore Top Ecosystem Brands</h3>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-5xl mx-auto items-center px-4">
              {allBrands.map((brand) => (
                <span 
                  key={brand}
                  onClick={() => handleBrandClick(brand)}
                  className="text-base sm:text-xl md:text-2xl font-black text-white/50 hover:text-[#00C896] hover:scale-110 cursor-pointer transition-all uppercase tracking-tight px-4 sm:px-5 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-[#00C896]/20 drop-shadow-xl"
                >
                  {brand}
                </span>
              ))}
            </div>
          </motion.div>
        </section>


        {/* 4. Interactive Benefit / Why CARZev stats cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[80vh] flex flex-col justify-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-black bg-[#00C896] text-xs font-bold tracking-wider uppercase font-mono px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(0,200,150,0.4)]">Our Core Purpose</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mt-6 font-sans drop-shadow-lg">
              Simplifying the Transition to Electric Mobility
            </h2>
            <p className="text-base text-white/80 mt-4 drop-shadow-md">
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
            
            <motion.div variants={itemVariants} className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col items-start gap-5 hover:border-[#00C896]/50 transition-colors group">
              <div className="p-4 bg-white/5 rounded-2xl text-white group-hover:bg-[#00C896] group-hover:text-black transition-colors">
                <Shield className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white font-sans">Unbiased Verifiable Data</h4>
              <p className="text-sm text-white/60 leading-relaxed font-light">
                Every battery capacity, power coefficient, and fast charging velocity is certified against ARAI and homologation press kits. Zero marketing exaggeration.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col items-start gap-5 hover:border-[#00C896]/50 transition-colors group">
              <div className="p-4 bg-white/5 rounded-2xl text-white group-hover:bg-[#00C896] group-hover:text-black transition-colors">
                <PenTool className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white font-sans">Adaptive Compare Engine</h4>
              <p className="text-sm text-white/60 leading-relaxed font-light">
                Pits key technical telemetry of multiple EVs side-by-side. Highlights advantages and winner parameters instantly using our custom comparison algorithm.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col items-start gap-5 hover:border-[#00C896]/50 transition-colors group">
              <div className="p-4 bg-white/5 rounded-2xl text-white group-hover:bg-[#00C896] group-hover:text-black transition-colors">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white font-sans">Subsidized Pricing Estimates</h4>
              <p className="text-sm text-white/60 leading-relaxed font-light">
                Dynamically calculates vehicle on-road pricing based on state-specific FAME parameters, road tax exclusions, and local registration parameters.
              </p>
            </motion.div>

          </motion.div>

        </section>

        {/* 5. Quick Call to Action */}
        <section className="bg-gradient-to-t from-black via-black/80 to-transparent py-24 min-h-[50vh] flex flex-col justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-8 mb-12"
          >
            <Sparkles className="w-12 h-12 text-[#01c896] animate-pulse drop-shadow-[0_0_20px_rgba(0,200,150,0.5)]" />
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-xl px-2">Need a Personalized Recommendation?</h2>
            <p className="text-white/80 text-sm md:text-lg max-w-2xl leading-relaxed font-light drop-shadow-md">
              Unsure whether to buy Nexon EV or MG ZS EV? Compare them instantly in our side-by-side grid, or search listings using your strict budget and range goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-lg pt-4">
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setCurrentPage('listings');
                }}
                className="flex-1 bg-[#00C896] text-black py-4 px-8 rounded-full font-bold text-sm hover:bg-white transition-all shadow-[0_0_30px_rgba(0,200,150,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]"
              >
                Browse Catalogue
              </button>
              <button 
                onClick={() => setCurrentPage('compare')}
                className="flex-1 bg-black/50 backdrop-blur-md text-white border border-white/20 py-4 px-8 rounded-full font-bold text-sm hover:bg-white/10 hover:border-white transition-all"
              >
                Open Compare Tool
              </button>
            </div>
          </motion.div>
        </section>
        
      </div>
    </div>
  );
}
