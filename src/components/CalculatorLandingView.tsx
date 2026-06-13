import React, { useState, useEffect } from 'react';
import { ArrowLeft, Coins, Zap, ShieldAlert, Sparkles, HelpCircle, Thermometer, Gauge, ChevronRight } from 'lucide-react';
import { EVModel, PageType } from '../types';
import { getBrandSlug } from '../utils/seoHelper';

interface CalculatorLandingViewProps {
  calcType: 'running-cost' | 'charging-cost' | 'range-calculator';
  selectedEvId: string;
  allEvs: EVModel[];
  selectedCity: string;
  setCurrentPage: (page: PageType, extra?: any) => void;
  onSelectEV: (evId: string) => void;
}

export default function CalculatorLandingView({
  calcType,
  selectedEvId,
  allEvs,
  selectedCity,
  setCurrentPage,
  onSelectEV
}: CalculatorLandingViewProps) {
  
  // 1. Core State
  const [commuteDistance, setCommuteDistance] = useState<number>(60);
  const [electricityRate, setElectricityRate] = useState<number>(7.5);
  const [fuelPrice, setFuelPrice] = useState<number>(101);
  const [iceMileage, setIceMileage] = useState<number>(14);

  const [chargingRateHome, setChargingRateHome] = useState<number>(7.0);
  const [chargingRatePublic, setChargingRatePublic] = useState<number>(22.0);

  const [drivingSpeed, setDrivingSpeed] = useState<number>(60);
  const [acUsage, setAcUsage] = useState<boolean>(true);
  const [drivingMode, setDrivingMode] = useState<'eco' | 'normal' | 'sport'>('normal');

  // Find active EV
  const ev = allEvs.find(e => e.id === selectedEvId) || allEvs[0];
  if (!ev) return null;

  // Extract battery size float
  const parseBattery = (batStr: string) => {
    const matched = batStr.match(/(\d+(\.\d+)?)\s*kWh/i);
    return matched && matched[1] ? parseFloat(matched[1]) : parseFloat(batStr) || 40.0;
  };
  const batterySize = parseBattery(ev.battery);

  // 2. Calculations
  
  // Running Cost calculations
  const monthlyKm = commuteDistance * 30;
  const petrolCostPerKm = iceMileage > 0 ? (fuelPrice / iceMileage) : 0;
  const evCostPerKm = ev.range > 0 ? ((batterySize * electricityRate) / ev.range) : 0.2;
  
  const petrolMonthlyCost = monthlyKm * petrolCostPerKm;
  const evMonthlyCost = monthlyKm * evCostPerKm;
  const monthlySavings = Math.max(0, petrolMonthlyCost - evMonthlyCost);
  const annualSavings = monthlySavings * 12;

  // Charging Cost calculations
  const totalCostHome = batterySize * chargingRateHome;
  const totalCostPublic = batterySize * chargingRatePublic;
  const costPer100KmHome = ev.range > 0 ? (totalCostHome / ev.range) * 100 : 150;
  const costPer100KmPublic = ev.range > 0 ? (totalCostPublic / ev.range) * 100 : 450;

  // Range Calculator calculations
  const calculateRealRange = () => {
    let baseRange = ev.range;
    
    // AC penalty (AC ON drops range by ~12%)
    if (acUsage) {
      baseRange *= 0.88;
    }
    
    // Speed penalty / bonus
    // EVs are most efficient between 50-70 km/h. At higher speeds, aerodynamic drag reduces efficiency.
    if (drivingSpeed > 70) {
      const excess = drivingSpeed - 70;
      baseRange *= Math.max(0.65, 1 - (excess * 0.007)); // max 35% drop at 120km/h
    } else if (drivingSpeed < 50) {
      const deficit = 50 - drivingSpeed;
      baseRange *= Math.max(0.85, 1 - (deficit * 0.004)); // slow crawl drop
    }

    // Driving Mode factor
    if (drivingMode === 'sport') {
      baseRange *= 0.85;
    } else if (drivingMode === 'eco') {
      baseRange *= 1.05;
    }

    return Math.round(baseRange);
  };

  const realRange = calculateRealRange();
  const efficiencyWhPerKm = realRange > 0 ? Math.round((batterySize * 1000) / realRange) : 150;

  // 3. Explanatory & SEO Text Content
  let headerTitle = '';
  let headerDesc = '';
  let seoExplanation = '';
  let faqs: { q: string; a: string }[] = [];

  const formatEVUrl = (item: EVModel) => {
    return `/ev/${getBrandSlug(item.brand)}/${item.id}`;
  };

  if (calcType === 'running-cost') {
    headerTitle = `${ev.brand} ${ev.name} Running Cost Calculator`;
    headerDesc = `Compare the operational cost of ${ev.brand} ${ev.name} against traditional petrol or diesel cars in ${selectedCity}.`;
    seoExplanation = `Operating a ${ev.brand} ${ev.name} in India is substantially cheaper than a standard ICE (Internal Combustion Engine) vehicle. On average, a petrol sedan demands ₹7 to ₹9 per kilometer in fuel cost. In contrast, the ${ev.brand} ${ev.name} runs at approximately ₹${evCostPerKm.toFixed(2)} per kilometer based on the domestic electricity tariff rate of ₹${electricityRate}/kWh in ${selectedCity}. By switching to the ${ev.brand} ${ev.name}, you save nearly 85% on monthly commuting costs, amortizing the purchase price within a few years.`;
    
    faqs = [
      {
        q: `What is the cost per kilometer of running the ${ev.brand} ${ev.name}?`,
        a: `With a grid tariff of ₹${electricityRate}/unit, the ${ev.brand} ${ev.name} operates at just ₹${evCostPerKm.toFixed(2)} per kilometer, compared to over ₹${petrolCostPerKm.toFixed(2)} per kilometer for a similar petrol car.`
      },
      {
        q: `How much can I save monthly with the ${ev.brand} ${ev.name}?`,
        a: `For a standard daily commute of ${commuteDistance} km, the monthly fuel cost drops from ₹${Math.round(petrolMonthlyCost)} (Petrol) to ₹${Math.round(evMonthlyCost)} (Electric), resulting in monthly savings of ₹${Math.round(monthlySavings)}.`
      },
      {
        q: `Does weather affect the running cost of the ${ev.brand} ${ev.name}?`,
        a: `Yes, extreme temperatures require intensive air conditioning usage, which can reduce driving range by 10-15%, marginally increasing the cost per kilometer.`
      }
    ];
  } else if (calcType === 'charging-cost') {
    headerTitle = `${ev.brand} ${ev.name} Charging Cost & Time`;
    headerDesc = `Find home and commercial DC charging costs for the ${ev.brand} ${ev.name} battery pack.`;
    seoExplanation = `The ${ev.brand} ${ev.name} is powered by a ${ev.battery} battery pack. Charging this battery at home using standard residential electricity rates in ${selectedCity} (₹${chargingRateHome}/unit) costs roughly ₹${Math.round(totalCostHome)}. Doing a full charge at public DC fast chargers (average commercial rate of ₹${chargingRatePublic}/unit) costs approximately ₹${Math.round(totalCostPublic)}. Public fast chargers refuel the battery much quicker but double the operational cost.`;

    faqs = [
      {
        q: `How much does it cost to charge the ${ev.brand} ${ev.name} at home?`,
        a: `At residential tariff rates of ₹${chargingRateHome}/kWh, a full charge of the ${batterySize} kWh battery pack in the ${ev.brand} ${ev.name} costs ₹${Math.round(totalCostHome)}.`
      },
      {
        q: `How long does it take to charge the ${ev.brand} ${ev.name}?`,
        a: `Using a standard 7.2 kW AC home charger, it takes about 7 to 9 hours for a full charge. Public 50 kW DC fast chargers can recharge from 10% to 80% in approximately ${ev.chargingTime}.`
      },
      {
        q: `Is frequent DC fast charging harmful to the battery pack?`,
        a: `Frequent use of high-power DC fast chargers can heat battery cells, causing slightly faster capacity degradation over time. It is recommended to use AC home charging for 80% of your charging cycles.`
      }
    ];
  } else if (calcType === 'range-calculator') {
    headerTitle = `${ev.brand} ${ev.name} Real World Range Calculator`;
    headerDesc = `Estimate real-world driving range of ${ev.brand} ${ev.name} under different speeds, AC, and drive mode conditions.`;
    seoExplanation = `While the certified range of the ${ev.brand} ${ev.name} is ${ev.range} km (${ev.rangeType}), real-world range depends heavily on driving behavior. Under moderate city traffic at ${drivingSpeed} km/h with AC ${acUsage ? 'ON' : 'OFF'} in ${drivingMode.toUpperCase()} mode, the estimated real range is ${realRange} km. This gives a discharge efficiency of ${efficiencyWhPerKm} Wh/km. High speeds (above 80 km/h) multiply aerodynamic drag, reducing battery range considerably.`;

    faqs = [
      {
        q: `Why is the real-world range of the ${ev.brand} ${ev.name} lower than the certified range?`,
        a: `ARAI/MIDC certifications are conducted in controlled lab tests without AC, wind drag, or steep inclines. Actual driving involves braking, high-speed drag, and air conditioning, which consumes battery power.`
      },
      {
        q: `How does high-speed highway driving affect the range?`,
        a: `EV motors are direct-drive. At highway speeds above 90 km/h, wind resistance rises exponentially, drawing high current from the battery and reducing the range by up to 25-30%.`
      },
      {
        q: `How can I maximize the range on a road trip?`,
        a: `Drive at a steady speed of 70-80 km/h, use Eco mode, utilize maximum regenerative braking, and minimize sudden accelerations.`
      }
    ];
  }

  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="calculator-landing-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation and header */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentPage('detail')}
            className="flex items-center gap-2 text-sm font-semibold text-[#8b919b] hover:text-[#9acbff] transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vehicle Details
          </button>
          
          <span className="text-xs font-bold text-[#00C896] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-[#00C896]" />
            Interactive Calculator Lab
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans mt-1">
            {headerTitle}
          </h1>
          <p className="text-sm text-[#8b919b] mt-2 max-w-3xl">
            {headerDesc}
          </p>
        </div>

        {/* Dynamic Calculator Interactive Segment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Controls Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1a1c20] p-6 sm:p-8 rounded-2xl border border-[#414750]/30 space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-[#414750]/15">
                <span className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                  Adjustment Sliders
                </span>
                <span className="text-xs text-[#8b919b] font-mono">{ev.brand} {ev.name} ({ev.battery})</span>
              </div>

              {/* RENDER RUNNING COST INPUTS */}
              {calcType === 'running-cost' && (
                <div className="space-y-6">
                  {/* Commute */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#8b919b]">Daily Commute Distance</span>
                      <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                        {commuteDistance} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={commuteDistance}
                      onChange={(e) => setCommuteDistance(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#00C896]"
                    />
                  </div>

                  {/* Electricity grid rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#8b919b]">Domestic Electricity Rate (per kWh)</span>
                      <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                        ₹ {electricityRate.toFixed(1)} / Unit
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      step="0.5"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#00C896]"
                    />
                  </div>

                  {/* Petrol cost / Mileage */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#414750]/15">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#8b919b]">Petrol price (per Liter)</span>
                        <span className="text-white font-mono font-bold bg-[#111317] py-1 px-2.5 rounded-md border border-[#414750]/20">
                          ₹ {fuelPrice}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="85"
                        max="115"
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#00C896]"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#8b919b]">Petrol Car Mileage (km/L)</span>
                        <span className="text-white font-mono font-bold bg-[#111317] py-1 px-2.5 rounded-md border border-[#414750]/20">
                          {iceMileage} km/L
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="22"
                        value={iceMileage}
                        onChange={(e) => setIceMileage(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#00C896]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER CHARGING COST INPUTS */}
              {calcType === 'charging-cost' && (
                <div className="space-y-6">
                  {/* Home tariff rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#8b919b]">Home AC Charging Rate (per kWh)</span>
                      <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                        ₹ {chargingRateHome.toFixed(1)} / Unit
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      step="0.5"
                      value={chargingRateHome}
                      onChange={(e) => setChargingRateHome(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#9acbff]"
                    />
                  </div>

                  {/* Public charging rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#8b919b]">Public DC Fast Charging Rate (per kWh)</span>
                      <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                        ₹ {chargingRatePublic.toFixed(1)} / Unit
                      </span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="32"
                      step="1"
                      value={chargingRatePublic}
                      onChange={(e) => setChargingRatePublic(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#9acbff]"
                    />
                  </div>
                </div>
              )}

              {/* RENDER RANGE CALCULATOR INPUTS */}
              {calcType === 'range-calculator' && (
                <div className="space-y-6">
                  {/* Driving Speed */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#8b919b]">Constant Driving Speed</span>
                      <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                        {drivingSpeed} km/h
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="120"
                      step="5"
                      value={drivingSpeed}
                      onChange={(e) => setDrivingSpeed(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#111317] rounded-all appearance-none cursor-pointer accent-[#ffb86f]"
                    />
                    <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                      <span>30 km/h (City Traffic)</span>
                      <span>120 km/h (High-speed Expressways)</span>
                    </div>
                  </div>

                  {/* AC and Drive Mode Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#414750]/15">
                    {/* AC Switch */}
                    <div className="space-y-2">
                      <span className="text-xs text-[#8b919b] block">Air Conditioning (AC Climate Control)</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAcUsage(true)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            acUsage
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-[#111317] text-[#c0c7d1] border-[#414750]/30'
                          }`}
                        >
                          AC ON (Normal Climate)
                        </button>
                        <button
                          onClick={() => setAcUsage(false)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            !acUsage
                              ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30'
                              : 'bg-[#111317] text-[#c0c7d1] border-[#414750]/30'
                          }`}
                        >
                          AC OFF (Eco Ventilation)
                        </button>
                      </div>
                    </div>

                    {/* Driving Mode */}
                    <div className="space-y-2">
                      <span className="text-xs text-[#8b919b] block">Driving Mode Setup</span>
                      <div className="flex gap-2">
                        {(['eco', 'normal', 'sport'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setDrivingMode(mode)}
                            className={`flex-1 py-2 rounded-xl text-[10px] sm:text-xs font-bold border capitalize transition-colors ${
                              drivingMode === mode
                                ? 'bg-[#9acbff]/10 text-[#9acbff] border-[#9acbff]/40'
                                : 'bg-[#111317] text-[#c0c7d1] border-[#414750]/30'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Results Column */}
          <div className="space-y-6">
            <div className="bg-[#1a1c20] border border-[#414750]/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              
              <div className="text-center pb-2 border-b border-[#414750]/15">
                <span className="text-[10px] uppercase font-bold text-[#8b919b] tracking-wider font-mono">
                  Analysis Matrix
                </span>
              </div>

              {/* RENDER RUNNING COST RESULTS */}
              {calcType === 'running-cost' && (
                <div className="space-y-6">
                  <div className="bg-[#111317] p-5 rounded-2xl border border-[#00C896]/20 text-center">
                    <span className="text-[10px] text-[#00C896] font-bold tracking-wider uppercase font-mono block">MONTHLY SAVINGS</span>
                    <span className="text-3xl font-black text-[#00C896] block mt-1">₹ {Math.round(monthlySavings).toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-[#8b919b] block mt-1">Annual savings of ₹{Math.round(annualSavings).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b919b]">EV Cost per KM</span>
                      <span className="text-white font-bold font-mono">₹ {evCostPerKm.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b919b]">Petrol Cost per KM</span>
                      <span className="text-red-400 font-bold font-mono">₹ {petrolCostPerKm.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#414750]/15 pt-3">
                      <span className="text-[#8b919b]">Annual Petrol cost</span>
                      <span className="text-[#8b919b] font-mono">₹ {Math.round(petrolMonthlyCost * 12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b919b]">Annual Electric cost</span>
                      <span className="text-[#8b919b] font-mono">₹ {Math.round(evMonthlyCost * 12).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER CHARGING COST RESULTS */}
              {calcType === 'charging-cost' && (
                <div className="space-y-6">
                  <div className="bg-[#111317] p-5 rounded-2xl border border-[#9acbff]/20 text-center">
                    <span className="text-[10px] text-[#9acbff] font-bold tracking-wider uppercase font-mono block">HOME FULL CHARGE</span>
                    <span className="text-3xl font-black text-white block mt-1">₹ {Math.round(totalCostHome)}</span>
                    <span className="text-[10px] text-[#8b919b] block mt-1">Public charge cost: ₹{Math.round(totalCostPublic)}</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b919b]">AC Charging Cost (100km)</span>
                      <span className="text-white font-bold font-mono">₹ {Math.round(costPer100KmHome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b919b]">DC Charging Cost (100km)</span>
                      <span className="text-[#ffb86f] font-bold font-mono">₹ {Math.round(costPer100KmPublic)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#414750]/15 pt-3">
                      <span className="text-[#8b919b]">Battery pack size</span>
                      <span className="text-[#8b919b] font-mono">{batterySize} kWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b919b]">Standard DC speed</span>
                      <span className="text-[#8b919b] font-mono">{ev.chargingDC || '50 kW'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER RANGE CALCULATOR RESULTS */}
              {calcType === 'range-calculator' && (
                <div className="space-y-6">
                  <div className="bg-[#111317] p-5 rounded-2xl border border-[#ffb86f]/20 text-center">
                    <span className="text-[10px] text-[#ffb86f] font-bold tracking-wider uppercase font-mono block">ESTIMATED REAL RANGE</span>
                    <span className="text-3xl font-black text-[#ffb86f] block mt-1">{realRange} km</span>
                    <span className="text-[10px] text-[#8b919b] block mt-1">MIDC Certified range: {ev.range} km</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b919b]">Discharge Efficiency</span>
                      <span className="text-white font-bold font-mono">{efficiencyWhPerKm} Wh / km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b919b]">AC Drain Factor</span>
                      <span className={`${acUsage ? 'text-red-400' : 'text-[#00C896]'} font-bold font-mono`}>
                        {acUsage ? '12% Loss' : 'Nominal'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#414750]/15 pt-3">
                      <span className="text-[#8b919b]">Speed range impact</span>
                      <span className="text-[#8b919b] font-mono">
                        {drivingSpeed > 80 ? 'High drag drop' : drivingSpeed < 40 ? 'Heavy traffic drop' : 'Optimal'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b919b]">Drive Mode impact</span>
                      <span className="text-[#8b919b] font-mono capitalize">{drivingMode} (+/- {drivingMode === 'eco' ? '5%' : drivingMode === 'sport' ? '-15%' : '0%'})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Booking Pre-fill */}
              <button
                onClick={() => onSelectEV(ev.id)}
                className="w-full bg-[#1b6ca8] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#114f7d] transition-all flex items-center justify-center gap-1.5"
              >
                Explore {ev.brand} {ev.name} Specs
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>

        {/* Detailed SEO Explanatory Content Block */}
        <div className="bg-[#1a1c20] p-6 sm:p-8 rounded-2xl border border-[#414750]/30 mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-3 font-sans">
            Technical Insight: {ev.brand} {ev.name} Real-World Analysis
          </h2>
          <p className="text-xs sm:text-sm text-[#c0c7d1] leading-relaxed">
            {seoExplanation}
          </p>
        </div>

        {/* Dynamic FAQ List */}
        <div className="border-t border-[#414750]/20 pt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-6 font-sans flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#9acbff]" />
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#1a1c20] border border-[#414750]/30 rounded-2xl p-6 space-y-2">
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
