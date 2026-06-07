import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, HelpCircle, RefreshCw, Zap, Flame, Globe } from 'lucide-react';
import { EVModel, PageType } from '../types';
import { evModels } from '../data/evData';

interface SavingsViewProps {
  setCurrentPage: (page: PageType) => void;
  onSelectEV: (evId: string) => void;
  selectedCity: string;
  allEvs: EVModel[];
}

export default function SavingsView({ setCurrentPage, onSelectEV, selectedCity, allEvs }: SavingsViewProps) {
  const [selectedEvId, setSelectedEvId] = useState<string>(allEvs[0]?.id || 'custom');
  
  // Custom interactive values
  const [commuteDistance, setCommuteDistance] = useState<number>(60); // daily km
  const [electricityRate, setElectricityRate] = useState<number>(7.5); // Rs per kWh
  const [fuelPrice, setFuelPrice] = useState<number>(101); // Rs per Liter
  const [iceMileage, setIceMileage] = useState<number>(14); // km per Liter
  
  // Custom EV metrics if no preset is chosen
  const [evBatterySize, setEvBatterySize] = useState<number>(40.5); // kWh
  const [evRange, setEvRange] = useState<number>(465); // km

  // Sync variables on selecting different EV model presets
  useEffect(() => {
    if (selectedEvId !== 'custom') {
      const selectedEv = allEvs.find(e => e.id === selectedEvId);
      if (selectedEv) {
        // Extract energy battery
        const matched = selectedEv.battery.match(/(\d+(\.\d+)?)\s*kWh/i);
        const batteryVal = matched && matched[1] ? parseFloat(matched[1]) : parseFloat(selectedEv.battery) || 40;
        setEvBatterySize(batteryVal);
        setEvRange(selectedEv.range);
        
        // Auto select appropriate companion ICE mileage based on vehicle category
        if (selectedEv.category === 'scooters' || selectedEv.category === 'bikes') {
          setIceMileage(50);
        } else {
          setIceMileage(14);
        }
      }
    }
  }, [selectedEvId]);

  // Calculations
  const monthlyKm = commuteDistance * 30;

  // ICE Fuel Cost Model
  const iceFuelConsumptionMonthly = iceMileage > 0 ? (monthlyKm / iceMileage) : 0;
  const iceMonthlyCost = iceFuelConsumptionMonthly * fuelPrice;

  // EV Cost Model
  // Efficiency: total battery size / certified range
  const evEfficiencyKwhPerKm = evRange > 0 ? (evBatterySize / evRange) : 0.15;
  const evElectricityNeededMonthly = monthlyKm * evEfficiencyKwhPerKm;
  const evMonthlyCost = evElectricityNeededMonthly * electricityRate;

  // Savings
  const monthlySavings = Math.max(0, iceMonthlyCost - evMonthlyCost);
  const annualSavings = monthlySavings * 12;
  const threeYearSavings = annualSavings * 3;
  const fiveYearSavings = annualSavings * 5;

  // Eco impact equivalents
  // CO2 saved: ~120g of carbon dioxide emission saved per km compared to premium fuels
  const co2SavedKg = Math.round((monthlyKm * 12 * 0.12));
  // Standard tree absorbs ~22kg of carbon dioxide per year
  const equivalentTreesPlanted = Math.round(co2SavedKg / 22);

  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="savings-calculator-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & header layout */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-sm font-semibold text-[#8b919b] hover:text-[#9acbff] transition-colors mb-3"
            id="back-home-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#00C896] uppercase tracking-wider font-mono">ECO-UTILITY LAB</span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans mt-0.5">
                Operating Cost & Carbon Offset Estimator
              </h1>
              <p className="text-xs text-[#8b919b] mt-1 font-mono">
                Compare grid tariffs with fossil fuels to analyze long-term amortization and environmental savings
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-[#1a1c20] px-4 py-2 rounded-xl border border-[#414750]/30 h-fit text-xs font-mono">
              <span className="text-[#8b919b]">Market pricing city:</span>
              <span className="text-[#9acbff] font-bold uppercase">{selectedCity}</span>
            </div>
          </div>
        </div>

        {/* Content body layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* A. Left column: control widgets */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1a1c20] p-6 sm:p-8 rounded-2xl border border-[#414750]/30 space-y-6" id="savings-inputs">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#414750]/15">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#00C896] animate-spin-slow" />
                  Eco-Energy Equations
                </span>
                <span className="text-[10px] text-[#8b919b] font-mono">REAL-TIME MATH</span>
              </div>

              {/* Subheader choice */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8b919b] uppercase tracking-wider block">Align with EV Model preset</label>
                <select
                  value={selectedEvId}
                  onChange={(e) => setSelectedEvId(e.target.value)}
                  className="w-full bg-[#111317] border border-[#414750]/60 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#00C896] cursor-pointer"
                  id="sav-ev-preset-select"
                >
                  <option value="custom">-- Custom Specification Setup --</option>
                  {allEvs.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.brand} {ev.name} (Range {ev.range} km)
                    </option>
                  ))}
                </select>
              </div>

              {/* Slider: Daily Commute Distance */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8b919b] font-medium">Daily Commute Distance</span>
                  <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                    {commuteDistance} km / day
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="250"
                  step="5"
                  value={commuteDistance}
                  onChange={(e) => setCommuteDistance(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#00C896]"
                  id="rng-dist"
                />
                <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                  <span>5 km / day</span>
                  <span>250 km / day</span>
                </div>
              </div>

              {/* Custom specs input block when 'custom' is selected */}
              {selectedEvId === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#111317]/50 rounded-xl border border-[#414750]/15">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[#8b919b] tracking-wider font-mono">Custom EV Battery capacity</label>
                    <div className="flex items-center bg-[#111317] border border-[#414750]/50 rounded-lg px-3 py-1.5 focus-within:border-[#00C896]">
                      <input
                        type="number"
                        value={evBatterySize}
                        onChange={(e) => setEvBatterySize(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-0 font-bold p-0 outline-none text-white text-xs"
                      />
                      <span className="text-[10px] font-bold text-[#8b919b] font-mono">kWh</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[#8b919b] tracking-wider font-mono">Custom Certified Range</label>
                    <div className="flex items-center bg-[#111317] border border-[#414750]/50 rounded-lg px-3 py-1.5 focus-within:border-[#00C896]">
                      <input
                        type="number"
                        value={evRange}
                        onChange={(e) => setEvRange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-0 font-bold p-0 outline-none text-white text-xs"
                      />
                      <span className="text-[10px] font-bold text-[#8b919b] font-mono">km</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid: Electricity tariff AND fuel price inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#414750]/15">
                
                {/* Electricity tariff */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[#8b919b] font-medium">Local Grid Tariff</label>
                    <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                      ₹ {electricityRate.toFixed(1)} / kWh
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="18"
                    step="0.5"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#00C896]"
                    id="rng-elec"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                    <span>₹ 3.0</span>
                    <span>₹ 18.0</span>
                  </div>
                </div>

                {/* Fuel price */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[#8b919b] font-medium">ICE Fuel Cost (Petrol/Diesel)</label>
                    <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                      ₹ {fuelPrice} / Liter
                    </span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="125"
                    step="1"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#00C896]"
                    id="rng-fuel"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                    <span>₹ 80</span>
                    <span>₹ 125</span>
                  </div>
                </div>

              </div>

              {/* Comparison Engine Mileage input */}
              <div className="space-y-2.5 pt-4 border-t border-[#414750]/15">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-[#8b919b] font-medium">Companion ICE Mileage</label>
                  <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                    {iceMileage} km / Liter
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="75"
                  step="1"
                  value={iceMileage}
                  onChange={(e) => setIceMileage(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#00C896]"
                  id="rng-mileage"
                />
                <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                  <span>8 km/L (SUV)</span>
                  <span>75 km/L (Moped)</span>
                </div>
              </div>

            </div>

            {/* Environmental carbon footprint card */}
            <div className="bg-gradient-to-r from-[#172522] to-[#12221b] p-6 rounded-2xl border border-[#00C896]/20 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-[#00C896] tracking-wider font-mono flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Eco-Impact Analysis
                </span>
                <h3 className="text-base font-extrabold text-white mt-1 leading-tight">Your Direct Contribution to India</h3>
              </div>

              <div className="bg-[#111317]/50 rounded-xl p-4 text-center border border-[#00C896]/10">
                <span className="text-[10px] text-[#8b919b] block font-mono">Annual CO₂ Offset</span>
                <span className="text-2xl font-black text-[#00C896] block mt-1">{co2SavedKg.toLocaleString()} kg</span>
                <p className="text-[10px] text-[#8b919b] mt-0.5 font-light leading-none">Emission reductions</p>
              </div>

              <div className="bg-[#111317]/50 rounded-xl p-4 text-center border border-[#00C896]/10">
                <span className="text-[10px] text-[#8b919b] block font-mono">Equivalent Trees Restored</span>
                <span className="text-2xl font-black text-[#ffb86f] block mt-1">{equivalentTreesPlanted} Trees</span>
                <p className="text-[10px] text-[#8b919b] mt-0.5 font-light leading-none">Standard carbon absorption</p>
              </div>

            </div>
          </div>

          {/* B. Sticky right summary savings panel */}
          <div className="space-y-6">
            <div className="bg-[#1a1c20] border border-[#414750]/40 rounded-2xl p-6 sm:p-8 space-y-6 sticky top-24 shadow-2xl" id="savings-results-pane">
              
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-[#8b919b] tracking-widest font-mono">Fossil-to-Grid Analysis</span>
                <p className="text-xs text-[#8b919b] mt-1">Estimations calculated based on {monthlyKm.toLocaleString()} km of monthly operation.</p>
              </div>

              {/* Main Glowing Savings Stat */}
              <div className="bg-[#111317] border border-[#00C896]/20 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-[#00C896]/10 text-[#00C896] px-1.5 py-0.5 rounded text-[8px] font-bold font-mono">
                  <Sparkles className="w-2.5 h-2.5 text-[#00C896]" />
                  90% SAVER
                </div>
                
                <span className="text-[10px] uppercase font-extrabold text-[#00C896] tracking-wider font-mono">ESTIMATED MONTHLY SAVINGS</span>
                <h4 className="text-3xl sm:text-4xl font-black text-[#00C896] tracking-tight mt-1.5 font-sans">
                  ₹ {Math.round(monthlySavings).toLocaleString('en-IN')}
                </h4>
                <p className="text-xs text-[#8b919b] mt-1 font-mono">/ Month in Operating fuel costs</p>
              </div>

              {/* Operating costs comparison visual bar */}
              <div className="space-y-3.5 text-xs">
                
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px] text-[#8b919b]">
                    <span>ICE Fuel Cost / mo</span>
                    <span className="text-red-400 font-bold">₹ {Math.round(iceMonthlyCost).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-[#111317] h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px] text-[#8b919b]">
                    <span>EV Electric Utility Grid / mo</span>
                    <span className="text-[#00C896] font-bold">₹ {Math.round(evMonthlyCost).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-[#111317] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#00C896] h-full rounded-full" style={{ width: `${Math.min(100, (evMonthlyCost / (iceMonthlyCost || 1)) * 100)}%` }}></div>
                  </div>
                </div>

              </div>

              {/* Amortization projection list */}
              <div className="border-t border-[#414750]/15 pt-5 space-y-3 text-xs">
                
                <div className="flex justify-between items-center">
                  <span className="text-[#8b919b]">Annual Direct Savings</span>
                  <span className="text-white font-bold font-mono">₹ {Math.round(annualSavings).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-[#ffb86f] font-bold">
                  <span>3-Year Long Run Savings</span>
                  <span className="font-mono">+ ₹ {Math.round(threeYearSavings).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-[#00C896] font-extrabold text-sm border-t border-[#414750]/15 pt-3">
                  <span>5-Year Total Recovery</span>
                  <span className="font-mono">+ ₹ {Math.round(fiveYearSavings).toLocaleString('en-IN')}</span>
                </div>

              </div>

              {/* Action Button: Prefill Booking Form */}
              {selectedEvId !== 'custom' && (
                <button
                  onClick={() => onSelectEV(selectedEvId)}
                  className="w-full bg-[#00C896] text-[#002116] py-3 rounded-xl font-bold text-xs hover:bg-[#009b74] transition-all flex items-center justify-center gap-1.5"
                >
                  Explore preset model &rarr;
                </button>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
