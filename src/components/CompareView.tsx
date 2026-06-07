import React, { useState } from 'react';
import { Plus, X, Sparkles, SlidersHorizontal, ArrowLeftRight, Check, Compass, Zap } from 'lucide-react';
import { EVModel, PageType } from '../types';

interface CompareViewProps {
  compareList: EVModel[];
  onRemoveFromCompare: (evId: string) => void;
  onAddFromCompareDropdown: (ev: EVModel) => void;
  allEvs: EVModel[];
  setCurrentPage: (page: PageType) => void;
  onSelectEV: (evId: string) => void;
}

export default function CompareView({
  compareList,
  onRemoveFromCompare,
  onAddFromCompareDropdown,
  allEvs,
  setCurrentPage,
  onSelectEV
}: CompareViewProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Available cars to add (excluding already added)
  const availableToAdd = allEvs.filter(
    (item) => !compareList.some((added) => added.id === item.id)
  );

  // Helper selectors to identify winners (Green Highlight Badges)
  const getWinnerId = (metric: 'price' | 'range' | 'battery' | 'acceleration' | 'power') => {
    if (compareList.length < 2) return null;

    let targetIdx = -1;
    let targetVal = metric === 'acceleration' ? Infinity : -Infinity;

    compareList.forEach((ev, idx) => {
      if (metric === 'price') {
        // Lower starts is winner
        if (ev.priceMin < targetVal) {
          targetVal = ev.priceMin;
          targetIdx = idx;
        }
      } else if (metric === 'range') {
        if (ev.range > targetVal) {
          targetVal = ev.range;
          targetIdx = idx;
        }
      } else if (metric === 'battery') {
        const batNum = parseFloat(ev.battery) || 0;
        if (batNum > targetVal) {
          targetVal = batNum;
          targetIdx = idx;
        }
      } else if (metric === 'acceleration') {
        const accNum = parseFloat(ev.acceleration) || Infinity;
        if (accNum < targetVal) {
          targetVal = accNum;
          targetIdx = idx;
        }
      } else if (metric === 'power') {
        const powNum = parseFloat(ev.power) || 0;
        if (powNum > targetVal) {
          targetVal = powNum;
          targetIdx = idx;
        }
      }
    });

    return targetIdx !== -1 ? compareList[targetIdx].id : null;
  };

  const winningPriceId = getWinnerId('price');
  const winningRangeId = getWinnerId('range');
  const winningBatteryId = getWinnerId('battery');
  const winningAccelId = getWinnerId('acceleration');
  const winningPowerId = getWinnerId('power');

  // Dynamic AI Verdict Text generator based on comparison selection
  const generateAIVerdict = () => {
    if (compareList.length === 0) {
      return "Please select or add at least two electric vehicles above to trigger the real-time AI Compare analysis matrix.";
    }
    if (compareList.length === 1) {
      return `Comparing ${compareList[0].name}. Please add another EV model to trigger comparative metrics and dynamic AI scoring.`;
    }

    // Spec check for standard 3-car SUV Nexon, ZS, Creta
    const hasNexon = compareList.some((e) => e.id.startsWith('nexon'));
    const hasMG = compareList.some((e) => e.id.includes('mg-zs'));
    const hasCreta = compareList.some((e) => e.id.includes('creta'));

    if (hasNexon && hasMG && hasCreta) {
      return {
        verdict: "Tata Nexon EV emerges as the most cost-effective entry point for standard zero-emission commuting. However, if your long-run goals prioritize highway cruising and interior soft-touch luxury, the MG ZS EV Excite’s higher battery capacity (50.3 kWh) justifies its price premium. The Hyundai Creta Electric holds strong anticipated styling and resale trust, but is pending physical volume deliveries.",
        highlight1: "Tata Nexon EV is the ultimate budget winner starting under ₹15 Lakh.",
        highlight2: "MG ZS EV Excite champions pure motor performance delivering 174.33 bhp."
      };
    }

    // Default general comparisons
    const rangeWinner = compareList.slice().sort((a,b) => b.range - a.range)[0];
    const budgetWinner = compareList.slice().sort((a,b) => a.priceMin - b.priceMin)[0];

    return {
      verdict: `A comprehensive review indicates that the ${rangeWinner.name} is your top performer for overcoming range anxiety with ${rangeWinner.range} km of range. Conversely, if your goal is minimizing ex-showroom capital expense, the ${budgetWinner.name} starts as the most approachable purchase, demanding only ₹${budgetWinner.priceMin} Lakh initially.`,
      highlight1: `${rangeWinner.name} provides the longest certified operational range.`,
      highlight2: `${budgetWinner.name} serves as the financial entry point for this segment.`
    };
  };

  const verdictData = generateAIVerdict();

  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="compare-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="pb-8 border-b border-[#414750]/20 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans flex items-center gap-2.5">
              <ArrowLeftRight className="w-6 h-6 text-[#9acbff]" />
              Compare Electric SUVs
            </h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-[#1b6ca8] text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-[#114f7d] transition-all flex items-center gap-1.5"
              id="add-to-compare-dropdown-btn"
            >
              <Plus className="w-4 h-4" />
              Add EV to Compare
            </button>
            
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-[#1e2024] border border-[#414750] rounded-xl shadow-2xl z-50 overflow-hidden text-xs text-[#e2e2e8]"
                id="compare-dropdown"
              >
                <div className="py-1 max-h-48 overflow-y-auto">
                  {availableToAdd.length === 0 ? (
                    <p className="p-3 text-[#8b919b] italic text-center">All available vehicles added.</p>
                  ) : (
                    availableToAdd.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => {
                          onAddFromCompareDropdown(ev);
                          setDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-[#282a2e] cursor-pointer transition-colors border-b border-[#414750]/20 font-semibold flex justify-between items-center"
                      >
                        <span>{ev.brand} {ev.name}</span>
                        <span className="text-[10px] text-[#8b919b] font-mono">₹{ev.priceMin}L</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {compareList.length === 0 ? (
          /* Empty Compare Basket visual block */
          <div className="bg-[#1a1c20] rounded-2xl border border-[#414750]/30 py-16 px-4 text-center max-w-xl mx-auto space-y-6">
            <div className="p-4 bg-[#1b6ca8]/10 rounded-full w-fit mx-auto text-[#9acbff]">
              <SlidersHorizontal className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Compare Basket is Empty</h3>
              <p className="text-xs text-[#8b919b] leading-relaxed">
                Add models from the homepage popular list or the main listings page to analyze specifications and read our AI verdict reviews.
              </p>
            </div>
            <button 
              onClick={() => setCurrentPage('listings')}
              className="bg-[#1b6ca8] text-white font-bold py-2.5 px-6 rounded-xl text-xs hover:bg-[#114f7d] transition-all"
            >
              Browse Listings
            </button>
          </div>
        ) : (
          /* Main active comparison interface */
          <div className="space-y-8" id="compare-grid-layout">
            
            {/* Top row of added car headings */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              
              {/* Card info help block */}
              <div className="bg-[#1a1c20]/45 p-5 rounded-2xl border border-[#414750]/15 space-y-2">
                <span className="text-xs font-bold text-[#00C896] uppercase tracking-wider font-mono">Compare Grid</span>
                <h4 className="text-sm font-bold text-white leading-tight">Side-by-Side Specifications</h4>
                <p className="text-[10px] text-[#8b919b] leading-relaxed">
                  Green badges indicate the segment leader for that specific telemetry. Click "View Specs" to visit full product profiles.
                </p>
              </div>

              {/* Added Car nodes rows */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {compareList.map((ev) => (
                  <div 
                    key={ev.id} 
                    className="bg-[#1a1c20] border border-[#414750]/35 rounded-2xl p-4 relative group flex flex-col justify-between h-44"
                  >
                    <button
                      onClick={() => onRemoveFromCompare(ev.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-[#111317]/80 hover:bg-red-400/20 hover:text-red-400 text-[#8b919b] transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <span className="text-[10px] text-[#8b919b] tracking-wider uppercase font-mono">{ev.brand}</span>
                      <h3 className="text-base font-bold text-white leading-tight mt-0.5 truncate pr-6 group-hover:text-[#9acbff]">{ev.name}</h3>
                      <p className="text-xs text-[#00C896] font-bold mt-1.5">{ev.range} km range</p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button 
                        onClick={() => onSelectEV(ev.id)}
                        className="w-full py-1.5 bg-[#111317] hover:bg-[#282a2e] text-[11px] font-bold text-[#c0c7d1] rounded-lg transition-all text-center"
                      >
                        View Specs
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Side-by-Side specifications compare table matching requirements */}
            <div className="bg-[#1a1c20] border border-[#414750]/30 rounded-2xl overflow-hidden shadow-xl" id="compare-specs-table">
              <div className="p-5 border-b border-[#414750]/20 bg-[#212328]/60">
                <span className="text-xs font-bold text-[#9acbff] uppercase tracking-wider font-mono">Specifications</span>
                <h3 className="text-base font-extrabold text-white mt-0.5">Specs Overview</h3>
              </div>
              
              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-xs text-left text-[#c0c7d1] table-fixed">
                  <thead>
                    <tr className="border-b border-[#414750]/40">
                      <th className="p-4 font-bold text-[#8b919b] uppercase tracking-wider w-1/4 font-mono">Features</th>
                      {compareList.map((ev) => (
                        <th key={ev.id} className="p-4 font-bold text-white text-sm">
                          <span className="px-2.5">{ev.name}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    
                    {/* EX-SHOWROOM MIN PRICE */}
                    <tr className="border-b border-[#414750]/20 hover:bg-[#212328]/35 transition-colors">
                      <td className="p-4 font-bold text-[#8b919b] uppercase tracking-wider w-1/4 font-mono">Min Price (Lakh)</td>
                      {compareList.map((ev) => {
                        const isWin = ev.id === winningPriceId;
                        return (
                          <td key={ev.id} className="p-4">
                            <span className={`px-2.5 py-1 rounded-md font-bold ${
                              isWin ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30' : 'text-white'
                            }`}>
                              ₹{ev.priceMin} L
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* CERTIFIED RANGE */}
                    <tr className="border-b border-[#414750]/20 hover:bg-[#212328]/35 transition-colors">
                      <td className="p-4 font-bold text-[#8b919b] uppercase tracking-wider w-1/4 font-mono">Certified Range</td>
                      {compareList.map((ev) => {
                        const isWin = ev.id === winningRangeId;
                        return (
                          <td key={ev.id} className="p-4">
                            <span className={`px-2.5 py-1 rounded-md font-bold ${
                              isWin ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30' : 'text-white'
                            }`}>
                              {ev.range} km ({ev.rangeType})
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* NOMINAL BATTERY CAPACITY */}
                    <tr className="border-b border-[#414750]/20 hover:bg-[#212328]/35 transition-colors">
                      <td className="p-4 font-bold text-[#8b919b] uppercase tracking-wider w-1/4 font-mono">Battery Capacity</td>
                      {compareList.map((ev) => {
                        const isWin = ev.id === winningBatteryId;
                        return (
                          <td key={ev.id} className="p-4">
                            <span className={`px-2.5 py-1 rounded-md font-bold ${
                              isWin ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30' : 'text-white'
                            }`}>
                              {ev.battery}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* ENGINE POWER OUTPUT */}
                    <tr className="border-b border-[#414750]/20 hover:bg-[#212328]/35 transition-colors">
                      <td className="p-4 font-bold text-[#8b919b] uppercase tracking-wider w-1/4 font-mono">Max Output (bhp)</td>
                      {compareList.map((ev) => {
                        const isWin = ev.id === winningPowerId;
                        return (
                          <td key={ev.id} className="p-4">
                            <span className={`px-2.5 py-1 rounded-md font-bold ${
                              isWin ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30' : 'text-white'
                            }`}>
                              {ev.power}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* ACCELERATION */}
                    <tr className="border-b border-[#414750]/20 hover:bg-[#212328]/35 transition-colors">
                      <td className="p-4 font-bold text-[#8b919b] uppercase tracking-wider w-1/4 font-mono">Accel (0-100 kmph)</td>
                      {compareList.map((ev) => {
                        const isWin = ev.id === winningAccelId;
                        return (
                          <td key={ev.id} className="p-4">
                            <span className={`px-2.5 py-1 rounded-md font-bold ${
                              isWin ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30' : 'text-white'
                            }`}>
                              {ev.acceleration || 'N/A'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* TORQUE CAPACITY */}
                    <tr className="border-b border-[#414750]/20 hover:bg-[#212328]/35 transition-colors">
                      <td className="p-4 font-bold text-[#8b919b] uppercase tracking-wider w-1/4 font-mono">Engine Torque</td>
                      {compareList.map((ev) => (
                        <td key={ev.id} className="p-4 font-semibold text-white">
                          <span className="px-2.5">{ev.torque || 'N/A'}</span>
                        </td>
                      ))}
                    </tr>

                    {/* DC FAST CHARGING */}
                    <tr className="border-b border-[#414750]/20 hover:bg-[#212328]/35 transition-colors">
                      <td className="p-4 font-bold text-[#8b919b] uppercase tracking-wider w-1/4 font-mono">DC Fast Charge</td>
                      {compareList.map((ev) => (
                        <td key={ev.id} className="p-4 font-semibold text-white">
                          <span className="px-2.5">{ev.chargingDC || ev.chargingTime}</span>
                        </td>
                      ))}
                    </tr>

                    {/* SEATING CAPACITY */}
                    <tr className="hover:bg-[#212328]/35 transition-colors">
                      <td className="p-4 font-bold text-[#8b919b] uppercase tracking-wider w-1/4 font-mono">Seating Capacity</td>
                      {compareList.map((ev) => (
                        <td key={ev.id} className="p-4 font-semibold text-white">
                          <span className="px-2.5">{ev.seatingCapacity} Seaters</span>
                        </td>
                      ))}
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Verdict segment box matching mockup */}
            <div className="bg-gradient-to-br from-[#1a2c3a] to-[#121c27] border border-[#1b6ca8]/40 rounded-2xl p-6 sm:p-8 space-y-6" id="compare-ai-verdict-box">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#00C896]/10 rounded-lg text-[#00C896] animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[#00C896] text-[10px] uppercase tracking-widest font-bold font-mono">Smart Insight</span>
                  <h3 className="text-lg font-bold text-white">Comparison Verdict</h3>
                </div>
              </div>

              {typeof verdictData === 'string' ? (
                <p className="text-xs text-[#c0c7d1] leading-relaxed italic">{verdictData}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-3">
                    <p className="text-xs text-[#c0c7d1] leading-relaxed">
                      {verdictData.verdict}
                    </p>
                  </div>
                  
                  <div className="space-y-3 border-l border-[#414750]/25 pl-0 md:pl-6">
                    <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">Key Takeaways</p>
                    
                    <div className="flex items-start gap-2 text-xs text-[#c0c7d1]">
                      <Zap className="w-4 h-4 text-[#00C896] mt-0.5" />
                      <span>{verdictData.highlight1}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-[#c0c7d1]">
                      <Zap className="w-4 h-4 text-[#00C896] mt-0.5" />
                      <span>{verdictData.highlight2}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
