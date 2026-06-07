import React from 'react';
import { PageType } from '../types';

interface FooterProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedCategory: (category: 'cars' | 'scooters' | 'bikes' | 'commercial' | 'all' | 'two-wheelers') => void;
}

export default function Footer({ setCurrentPage, setSelectedCategory }: FooterProps) {
  const handleNavClick = (page: PageType, category?: 'cars' | 'scooters' | 'bikes' | 'commercial' | 'two-wheelers') => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory('all');
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 bg-[#111317] border-t border-[#414750]/30 text-[#c0c7d1]" id="footer">
      
      {/* Editorial Blog / Info Snippets Section - Fully Realized Editorial */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/*
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#414750]/20">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-sans">EV News Highlight</h4>
            <p className="text-xs text-[#8b919b] leading-relaxed mb-3">Tata Motors launches the ultra-premium Nexon EV in Delhi with enhanced regenerative braking pads.</p>
            <span className="text-xs text-[#9acbff] cursor-pointer hover:underline">Read full article &rarr;</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-sans">Eco-Savings Corner</h4>
            <p className="text-xs text-[#8b919b] leading-relaxed mb-3">Learn how standard state RTO subsidies under the FAME Scheme can reduce premium vehicle taxes by up to ₹1.5 Lakh.</p>
            <span className="text-xs text-[#9acbff] cursor-pointer hover:underline">Calculate your savings &rarr;</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-sans">Battery Charging Safety</h4>
            <p className="text-xs text-[#8b919b] leading-relaxed mb-3">Find tips on structuring home 15A slow charger grids to maximize battery cell life cycle over 8 years.</p>
            <span className="text-xs text-[#9acbff] cursor-pointer hover:underline">View charging handbook &rarr;</span>
          </div>
        </div>
        */}

        {/* Corporate column lists */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-12">
          
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center cursor-pointer w-fit py-1"
            >
              <img 
                src="/images/logo.webp" 
                alt="CARZev Logo" 
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-[#8b919b] mt-4 leading-relaxed max-w-sm">
              Indias premier platform for discovering, comparing, and transitioning to sustainable electric mobility. Engineered for high-stakes, data-driven decisions.
            </p>
            {/* <p className="text-xs text-[#8b919b]/80 mt-2 font-mono">UTC Clock: 2026-06-03 11:37:08</p> */}
          </div>

          {/* Quick Category links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-sans">Company</h4>
            <ul className="space-y-2 text-sm text-[#8b919b]">
              <li>
                <span 
                  onClick={() => handleNavClick('listings', 'cars')} 
                  className="cursor-pointer hover:text-white transition-colors"
                >
                  Electric Cars
                </span>
              </li>
              {/*
              <li>
                <span 
                  onClick={() => handleNavClick('listings', 'two-wheelers')} 
                  className="cursor-pointer hover:text-white transition-colors"
                >
                  Electric Scooters & Bikes
                </span>
              </li>
              */}
              <li>
                <span 
                  onClick={() => handleNavClick('compare')} 
                  className="cursor-pointer hover:text-white transition-colors"
                >
                  Compare Hub
                </span>
              </li>
            </ul>
          </div>

          {/* Legal columns */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-sans">Legal</h4>
            <ul className="space-y-2 text-sm text-[#8b919b]">
              <li>
                <span 
                  onClick={() => handleNavClick('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </span>
              </li>
              <li>
                <span 
                  onClick={() => handleNavClick('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms and Conditions
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copy bar */}
        <div className="border-t border-[#414750]/20 mt-16 pt-8 text-center text-xs text-[#8b919b] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 CARZev Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer select-none">Twitter</span>
            <span className="hover:text-white cursor-pointer select-none">LinkedIn</span>
            <span className="hover:text-white cursor-pointer select-none">YouTube</span>
          </div>
        </div>

      </div>

    </footer>
  );
}
