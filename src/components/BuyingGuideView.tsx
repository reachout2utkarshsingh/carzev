import React from 'react';
import { ArrowLeft, Award, Flame, ShieldCheck, Zap, DollarSign, Users, Milestone, HelpCircle, ChevronRight } from 'lucide-react';
import { EVModel, PageType } from '../types';
import { getBrandSlug } from '../utils/seoHelper';

interface BuyingGuideViewProps {
  guideId: string; // 'under-10-lakh' | 'under-15-lakh' | 'family' | 'long-range'
  allEvs: EVModel[];
  setCurrentPage: (page: PageType, extra?: any) => void;
  onSelectEV: (evId: string) => void;
}

export default function BuyingGuideView({
  guideId,
  allEvs,
  setCurrentPage,
  onSelectEV
}: BuyingGuideViewProps) {
  
  // 1. Determine guide content and filter/sort logic
  let title = '';
  let subtitle = '';
  let introText = '';
  let filteredEvs: EVModel[] = [];
  let faqs: { q: string; a: string }[] = [];

  const formatEVUrl = (ev: EVModel) => {
    return `/ev/${getBrandSlug(ev.brand)}/${ev.id}`;
  };

  if (guideId === 'under-10-lakh') {
    title = 'Best Electric Vehicles Under 10 Lakh in India 2026';
    subtitle = 'Most affordable electric cars and two-wheelers for daily urban commuting.';
    introText = 'Transitioning to clean energy does not have to break the bank. Under a budget of ₹10 Lakh, Indian consumers have access to stellar electric scooters, bikes, and entry-level electric hatchbacks. Here is our curated list of top-performing budget EVs sorted by value-for-money, certified range, and charging efficiency.';
    
    filteredEvs = allEvs
      .filter(ev => ev.priceMin <= 10)
      .sort((a, b) => a.priceMin - b.priceMin);

    faqs = [
      {
        q: 'Which is the cheapest electric car available under 10 lakh in India?',
        a: 'The MG Comet EV and Tata Tiago EV are the leading entry-level electric cars in India under 10 Lakh. The Comet EV starts around ₹6.99 Lakh, while the Tiago EV offers a larger body and starts just under ₹8 Lakh.'
      },
      {
        q: 'What is the typical driving range of EVs under 10 lakh?',
        a: 'Typical real-world range for electric cars in this bracket spans 150 km to 250 km on a single charge, which is highly sufficient for daily city drives.'
      },
      {
        q: 'Do state subsidies apply to EVs under 10 lakh?',
        a: 'Yes, most state governments in India offer road tax waivers, registration fee exemptions, and direct FAME-II incentives for electric two-wheelers and passenger cars costing under ₹15 Lakh.'
      }
    ];
  } else if (guideId === 'under-15-lakh') {
    title = 'Best Electric Cars Under 15 Lakh in India 2026';
    subtitle = 'Top-rated, value-for-money electric hatchbacks, compact SUVs, and sedans.';
    introText = 'The ₹10 Lakh to ₹15 Lakh segment is the sweet spot of the Indian EV market. In this budget, buyers can get spacious cabins, premium safety features, fast DC charging capabilities, and certified ranges exceeding 300 km. Read our detailed specs comparisons to pick your best EV.';
    
    filteredEvs = allEvs
      .filter(ev => ev.priceMin <= 15 && ev.category === 'cars')
      .sort((a, b) => a.priceMin - b.priceMin);

    faqs = [
      {
        q: 'What are the best electric cars under 15 Lakh in India?',
        a: 'Tata Punch EV, Tata Tiago EV, and Citroen eC3 are the top choices in this range. The Punch EV stands out with its high ground clearance and modern cockpit features.'
      },
      {
        q: 'Can I use a fast DC charger for cars under 15 lakh?',
        a: 'Yes, models like the Punch EV and Citroen eC3 support DC fast charging, allowing you to charge from 10% to 80% in under 56 minutes at public charging stations.'
      },
      {
        q: 'What is the battery warranty offered on EVs in this price range?',
        a: 'Most manufacturers, including Tata and MG, offer a standard warranty of 8 years or 1,60,000 km on the battery pack and electric motor.'
      }
    ];
  } else if (guideId === 'family') {
    title = 'Best Electric Family Cars & SUVs in India 2026';
    subtitle = 'Spacious 5 and 7-seater electric vehicles with high safety and comfort.';
    introText = 'When choosing an electric vehicle for family travel, cabin space, rear-seat comfort, boot capacity, and crash safety ratings are paramount. This guide highlights the best premium electric SUVs and multi-purpose vehicles (MPVs) in India that comfortably fit 5 to 7 passengers and offer long highway ranges.';
    
    filteredEvs = allEvs
      .filter(ev => ev.seatingCapacity >= 5 && ev.category === 'cars')
      .sort((a, b) => b.rating - a.rating);

    faqs = [
      {
        q: 'Which is the best 7-seater electric car for families in India?',
        a: 'The BYD eMAX 7 (formerly e6 MPV) is the premier 7-seater electric family car in India. It offers massive legroom, high boot volume, and an ultra-safe Blade Battery pack, starting around ₹26.9 Lakh.'
      },
      {
        q: 'Are electric SUVs safe for long family highway journeys?',
        a: 'Absolutely. Many modern Indian electric SUVs like the Tata Nexon EV and Harrier EV come with 5-star GNCAP safety ratings, multiple airbags, ESP, and robust ADAS capabilities.'
      },
      {
        q: 'How much luggage space is available in family EVs?',
        a: 'Family-class electric SUVs typically offer between 350 to 580 liters of boot space, which easily accommodates luggage for weekend getaways.'
      }
    ];
  } else if (guideId === 'long-range') {
    title = 'Best Long Range Electric Cars in India 2026';
    subtitle = 'Electric vehicles with the longest certified ranges to conquer range anxiety.';
    introText = 'Range anxiety remains a major concern for highway cruisers. This guide lists the top electric cars in India boasting certified ranges of 450 km or more. These vehicles utilize large battery capacities (60 kWh+) and intelligent thermal management to deliver stress-free highway performance.';
    
    filteredEvs = allEvs
      .filter(ev => ev.range >= 450 && ev.category === 'cars')
      .sort((a, b) => b.range - a.range);

    faqs = [
      {
        q: 'Which electric car has the longest range in India?',
        a: 'The BYD Seal and Kia EV9 lead the segment with certified ranges exceeding 650 km. In the mainstream segment, the Mahindra BE 6e, BYD Atto 3, and Tata Curvv EV offer ranges between 500 km and 585 km.'
      },
      {
        q: 'What is the difference between ARAI range and real-world range?',
        a: 'ARAI/MIDC ranges are measured in controlled lab environments. Real-world highway range is typically 20% to 30% lower depending on AC usage, speed, and terrain.'
      },
      {
        q: 'Do long-range EVs charge faster?',
        a: 'Yes, long-range EVs with larger batteries typically support higher DC charging rates. For instance, the Mahindra BE 6e supports 175 kW DC fast charging, refueling the battery in just 20 minutes.'
      }
    ];
  }

  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="buying-guide-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Back Button */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-sm font-semibold text-[#8b919b] hover:text-[#9acbff] transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <span className="text-xs font-bold text-[#00C896] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            Curated Buying Guide
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans mt-1">
            {title}
          </h1>
          <p className="text-sm text-[#8b919b] mt-2 max-w-3xl">
            {subtitle}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/30 mb-8">
          <p className="text-sm text-[#c0c7d1] leading-relaxed">
            {introText}
          </p>
        </div>

        {/* Specs Comparison Matrix */}
        <div className="bg-[#1a1c20] border border-[#414750]/30 rounded-2xl overflow-hidden shadow-xl mb-12">
          <div className="p-5 border-b border-[#414750]/20 bg-[#212328]/60">
            <h3 className="text-base font-extrabold text-white">Segment Comparison Matrix</h3>
            <p className="text-xs text-[#8b919b] mt-0.5">Quick specs lookup for the best choices in this segment.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-[#c0c7d1]">
              <thead className="bg-[#111317]/50 border-b border-[#414750]/40 text-[#8b919b] uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-4">Model</th>
                  <th className="p-4">Price Range (Ex-Showroom)</th>
                  <th className="p-4">Certified Range</th>
                  <th className="p-4">Battery size</th>
                  <th className="p-4">Seating</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#414750]/15">
                {filteredEvs.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#212328]/35 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {ev.brand} {ev.name}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#ffb86f]">
                      ₹ {ev.priceMin} - {ev.priceMax} Lakh
                    </td>
                    <td className="p-4 font-mono text-[#00C896] font-bold">
                      {ev.range} km ({ev.rangeType})
                    </td>
                    <td className="p-4 font-mono">{ev.battery}</td>
                    <td className="p-4">{ev.seatingCapacity} Seater</td>
                    <td className="p-4 text-center">
                      <a 
                        href={formatEVUrl(ev)}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectEV(ev.id);
                        }}
                        className="inline-flex items-center gap-1 text-[#9acbff] hover:text-[#5fa6f1] font-bold hover:underline"
                      >
                        Specs <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Editorial Reviews */}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-6 font-sans">
          Curated Model Analyses
        </h2>
        <div className="space-y-8 mb-12">
          {filteredEvs.map((ev, index) => (
            <div 
              key={ev.id}
              className="bg-[#1a1c20] border border-[#414750]/30 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-[#9acbff]/45 transition-colors"
            >
              {/* Product Thumbnail */}
              <div className="w-full md:w-1/4 flex-shrink-0 bg-[#111317] rounded-xl border border-[#414750]/20 p-4 flex items-center justify-center">
                <img 
                  src={ev.image} 
                  alt={`${ev.brand} ${ev.name}`}
                  className="max-h-36 w-auto object-contain hover:scale-105 transition-transform"
                />
              </div>

              {/* Product Editorial Detail */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#414750]/15 pb-3">
                  <div>
                    <span className="text-[10px] text-[#8b919b] font-mono tracking-widest uppercase">#{index + 1} RECOMMENDED CHOICE</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">{ev.brand} {ev.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#8b919b] font-mono block">EX-SHOWROOM</span>
                    <span className="text-sm font-bold text-[#ffb86f] font-mono">₹ {ev.priceMin} - {ev.priceMax} Lakh</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#c0c7d1] leading-relaxed">
                  {ev.description}
                </p>

                {/* Key Specs Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#111317]/50 p-3.5 rounded-xl border border-[#414750]/15 text-xs font-mono">
                  <div>
                    <span className="text-[#8b919b] block text-[10px]">BATTERY</span>
                    <span className="text-white font-bold">{ev.battery}</span>
                  </div>
                  <div>
                    <span className="text-[#8b919b] block text-[10px]">CERTIFIED RANGE</span>
                    <span className="text-[#00C896] font-bold">{ev.range} km</span>
                  </div>
                  <div>
                    <span className="text-[#8b919b] block text-[10px]">POWER OUTPUT</span>
                    <span className="text-white font-bold">{ev.power}</span>
                  </div>
                  <div>
                    <span className="text-[#8b919b] block text-[10px]">CHARGING TIME</span>
                    <span className="text-[#9acbff] font-bold truncate block">{ev.chargingTime}</span>
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#172522] border border-[#00C896]/20 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-[#00C896] font-mono uppercase tracking-wider block mb-1">PROS</span>
                    <ul className="list-disc pl-4 text-xs text-[#c0c7d1] space-y-1">
                      {ev.pros.slice(0, 2).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#261f1f] border border-red-500/10 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-red-400 font-mono uppercase tracking-wider block mb-1">CONS</span>
                    <ul className="list-disc pl-4 text-xs text-[#c0c7d1] space-y-1">
                      {ev.cons.slice(0, 2).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Link buttons */}
                <div className="flex gap-3 pt-2">
                  <a
                    href={formatEVUrl(ev)}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectEV(ev.id);
                    }}
                    className="bg-[#1b6ca8] text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-[#114f7d] transition-colors"
                  >
                    View Full Specifications
                  </a>
                  
                  {/* Compare back link */}
                  <a
                    href={`/compare/${filteredEvs[0].id}-vs-${ev.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      // Redirect compare state in app
                      setCurrentPage('compare', { compareIds: [filteredEvs[0].id, ev.id] });
                    }}
                    className="border border-[#414750]/50 text-[#c0c7d1] hover:text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-[#282a2e] transition-colors"
                  >
                    Compare with Segment Benchmark
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Editorial FAQ Blocks */}
        <div className="border-t border-[#414750]/20 pt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-6 font-sans flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#9acbff]" />
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="faq-accordion">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#1a1c20] border border-[#414750]/30 rounded-2xl p-6 space-y-2">
                <h4 className="text-sm sm:text-base font-bold text-white">{faq.q}</h4>
                <p className="text-xs sm:text-sm text-[#8b919b] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
