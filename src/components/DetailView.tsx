import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Battery, Gauge, Zap, Calendar, Heart, Share2, ClipboardList, ThumbsUp, ThumbsDown, User, Phone, Mail, CheckCircle, ShieldAlert, Calculator, Coins } from 'lucide-react';
import { EVModel, PageType } from '../types';
import { addTestDriveRequest } from '../lib/evService';

interface DetailViewProps {
  evId: string;
  setCurrentPage: (page: PageType) => void;
  onAddToCompare: (ev: EVModel) => void;
  compareList: EVModel[];
  allEvs: EVModel[];
  selectedCity: string;
}

export default function DetailView({
  evId,
  setCurrentPage,
  onAddToCompare,
  compareList,
  allEvs,
  selectedCity
}: DetailViewProps) {
  // Find current EV
  const ev = allEvs.find(item => item.id === evId) || allEvs[0];

  // Image swap state
  const [activeImage, setActiveImage] = useState(ev.image);

  // Form Booking Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    preferredDate: '',
  });

  // Reset active image when EV changes
  useEffect(() => {
    setActiveImage(ev.image);
    setBookingSubmitted(false);
  }, [ev]);

  const isAdded = compareList.some(item => item.id === ev.id);

  // Subsidy calculations based on city
  const calculateOnRoadCost = () => {
    const baseEx = ev.priceMin;
    let rtoTax = 0; // standard RTO tax
    let stateSubsidy = 0; // government EV subsidy
    let insurance = 0.55; // insurance average Lakhs

    if (selectedCity === "New Delhi") {
      rtoTax = 0.0; // 0% electric registration tax in Delhi
      stateSubsidy = 1.5; // Up to 1.5 Lakh subsidy
    } else if (selectedCity === "Mumbai") {
      rtoTax = 0.05 * baseEx; // 5% registration
      stateSubsidy = 1.0;
    } else if (selectedCity === "Bengaluru") {
      rtoTax = 0.04 * baseEx;
      stateSubsidy = 1.1;
    } else if (selectedCity === "Pune") {
      rtoTax = 0.05 * baseEx;
      stateSubsidy = 1.0;
    } else {
      rtoTax = 0.03 * baseEx;
      stateSubsidy = 0.8;
    }

    const total = baseEx + rtoTax + insurance - stateSubsidy;
    return {
      exShowroom: baseEx.toFixed(2),
      rto: rtoTax.toFixed(2),
      subsidy: stateSubsidy.toFixed(2),
      insurance: insurance.toFixed(2),
      onRoad: total > 0 ? total.toFixed(2) : baseEx.toFixed(2)
    };
  };

  const costSummary = calculateOnRoadCost();
  const onRoadNum = parseFloat(costSummary.onRoad) || ev.priceMin;

  // EMI Calculator states
  const [emiPrice, setEmiPrice] = useState(onRoadNum);
  const [downPayment, setDownPayment] = useState(parseFloat((onRoadNum * 0.2).toFixed(2)));
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(5);

  // Operating Cost Calculator states
  const [commuteDistance, setCommuteDistance] = useState(50); // Daily km
  const [electricityRate, setElectricityRate] = useState(7); // Rs/kWh
  const [fuelPrice, setFuelPrice] = useState(101); // Rs/L
  const [iceMileage, setIceMileage] = useState(ev.category === 'scooters' || ev.category === 'bikes' ? 50 : 15); // km/L

  // Sync inputs with vehicle price guidelines when EV or Selected City changes
  useEffect(() => {
    const freshSummary = calculateOnRoadCost();
    const freshOnRoadNum = parseFloat(freshSummary.onRoad) || ev.priceMin;
    setEmiPrice(freshOnRoadNum);
    setDownPayment(parseFloat((freshOnRoadNum * 0.2).toFixed(2)));
    setIceMileage(ev.category === 'scooters' || ev.category === 'bikes' ? 50 : 15);
  }, [ev, selectedCity]);

  // Derived EMI values
  // Clamp downPayment so it does not exceed emiPrice
  const clampedDownPayment = Math.min(downPayment, emiPrice);
  const loanAmountLakhs = Math.max(0, emiPrice - clampedDownPayment);
  const loanAmountRupees = loanAmountLakhs * 100000;
  
  const calculateEMI = () => {
    const R = interestRate;
    const r = R / (12 * 100);
    const n = tenureYears * 12;
    
    if (loanAmountRupees <= 0) return { emi: 0, totalInterest: 0, totalRepayment: 0 };
    if (r === 0) return { emi: loanAmountRupees / n, totalInterest: 0, totalRepayment: loanAmountRupees };
    
    const emiVal = (loanAmountRupees * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalRepaymentVal = emiVal * n;
    const totalInterestVal = totalRepaymentVal - loanAmountRupees;
    
    return {
      emi: emiVal,
      totalInterest: totalInterestVal,
      totalRepayment: totalRepaymentVal
    };
  };

  const { emi, totalInterest, totalRepayment } = calculateEMI();

  // Derived Operating Cost Saving value
  const parseBatteryKwh = (batteryStr: string) => {
    const matched = batteryStr.match(/(\d+(\.\d+)?)\s*kWh/i);
    if (matched && matched[1]) {
      return parseFloat(matched[1]);
    }
    const val = parseFloat(batteryStr);
    return isNaN(val) ? 0 : val;
  };
  const batteryKwhValue = parseBatteryKwh(ev.battery);
  
  // Calculate efficiency (kWh per km)
  const getEvEfficiencyKwhPerKm = () => {
    if (batteryKwhValue > 0 && ev.range > 0) {
      const computed = batteryKwhValue / ev.range;
      if (computed > 0.01 && computed < 0.5) {
        return computed;
      }
    }
    // Category fallbacks
    return ev.category === 'scooters' || ev.category === 'bikes' ? 0.03 : 0.15;
  };

  const evEfficiency = getEvEfficiencyKwhPerKm();
  const monthlyKm = commuteDistance * 30;
  
  // ICE cost
  const iceFuelNeeded = iceMileage > 0 ? (monthlyKm / iceMileage) : 0;
  const iceMonthlyCost = iceFuelNeeded * fuelPrice;
  
  // EV cost
  const evElectricityNeeded = monthlyKm * evEfficiency;
  const evMonthlyCost = evElectricityNeeded * electricityRate;
  
  const monthlySavings = Math.max(0, iceMonthlyCost - evMonthlyCost);
  const annualSavings = monthlySavings * 12;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call firestore service
    addTestDriveRequest({
      name: bookingForm.name,
      phone: bookingForm.phone,
      preferredDate: bookingForm.preferredDate,
      city: selectedCity,
      evId: ev.id,
      evName: ev.name
    })
    .then(() => {
      // Save backup to localStorage
      localStorage.setItem(`booking_${ev.id}`, JSON.stringify({
        ...bookingForm,
        city: selectedCity,
        evName: ev.name,
        timestamp: new Date().toISOString()
      }));
      setBookingSubmitted(true);
    })
    .catch((error) => {
      console.error("Failed to store test drive request in Firestore:", error);
      alert("Failed to submit request. If your Firestore is in production mode, make sure you temporarily enabled writes in your Firestore rules!");
    });
  };

  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="detail-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button 
          onClick={() => setCurrentPage('listings')}
          className="flex items-center gap-2 text-xs font-bold text-[#8b919b] hover:text-white mb-6 uppercase tracking-wider transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#9acbff]" />
          Back to Listings
        </button>

        {/* 1. Primary Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" id="detail-grid-core">
          
          {/* 1A. Image segment & Swappable thumbnails */}
          <div className="space-y-4">
            
            {/* Main view aspect framing */}
            <div className="relative aspect-video bg-[#1a1c20] rounded-2xl border border-[#414750]/30 overflow-hidden flex items-center justify-center">
              <img 
                src={activeImage} 
                alt={ev.name} 
                className="w-full h-full object-contain p-6"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white py-1 px-3 rounded-full text-[10px] font-mono tracking-wider">
                {ev.brand}
              </div>
            </div>

            {/* Thumbnail rows */}
            {ev.thumbnails && ev.thumbnails.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                <div 
                  onClick={() => setActiveImage(ev.image)}
                  className={`aspect-video rounded-xl overflow-hidden border cursor-pointer bg-[#1a1c20] ${
                    activeImage === ev.image ? 'border-[#9acbff] ring-2 ring-[#9acbff]/30' : 'border-[#414750]/30 hover:border-[#8b919b]'
                  }`}
                >
                  <img src={ev.image} alt="Main" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                </div>
                {ev.thumbnails.map((thumb, index) => (
                  <div 
                    key={index}
                    onClick={() => setActiveImage(thumb)}
                    className={`aspect-video rounded-xl overflow-hidden border cursor-pointer bg-[#1a1c20] ${
                      activeImage === thumb ? 'border-[#9acbff] ring-2 ring-[#9acbff]/30' : 'border-[#414750]/30 hover:border-[#8b919b]'
                    }`}
                  >
                    <img src={thumb} alt={`Thumb ${index}`} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-[#8b919b] text-center italic mt-1 bg-[#1a1c20]/45 p-2 rounded-xl border border-[#414750]/15">
              💡 Interactive Media Console: Choose any thumbnail above to examine vehicle alloy, cockpit styling, or charging ports.
            </p>

          </div>

          {/* 1B. Text Descriptions & Specifications Overview */}
          <div className="space-y-6">
            
            <div>
              <span className="text-xs font-bold text-[#00C896] bg-[#00C896]/10 py-1 px-3 rounded-full uppercase tracking-wider font-mono">
                {ev.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight font-sans">
                {ev.name}
              </h1>
              <p className="text-sm text-[#8b919b] mt-1 font-mono">{ev.brand}</p>
            </div>


            {/* Price tag ranges */}
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold text-[#8b919b] tracking-wider font-mono">Ex-Showroom Price Range</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#9acbff] tracking-tight">
                ₹{ev.priceMin} - ₹{ev.priceMax || ev.priceMin} Lakh
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#c0c7d1] leading-relaxed">
              {ev.description}
            </p>

            {/* 6 Grid Icons Specifications Overview and Power telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              
              <div className="bg-[#1a1c20] p-4 rounded-xl border border-[#414750]/20 flex items-center gap-3">
                <Battery className="w-5 h-5 text-[#00C896]" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#8b919b] font-mono leading-none">Battery</p>
                  <p className="text-xs text-white font-bold mt-1">{ev.battery}</p>
                </div>
              </div>

              <div className="bg-[#1a1c20] p-4 rounded-xl border border-[#414750]/20 flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#ffb86f]" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#8b919b] font-mono leading-none">Range</p>
                  <p className="text-xs text-white font-bold mt-1">{ev.range} km</p>
                </div>
              </div>

              <div className="bg-[#1a1c20] p-4 rounded-xl border border-[#414750]/20 flex items-center gap-3">
                <Gauge className="w-5 h-5 text-[#9acbff]" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#8b919b] font-mono leading-none">Power</p>
                  <p className="text-xs text-white font-bold mt-1">{ev.power}</p>
                </div>
              </div>

              <div className="bg-[#1a1c20] p-4 rounded-xl border border-[#414750]/20 flex items-center gap-3">
                <div className="text-purple-400 font-bold text-xs font-mono">Tq</div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#8b919b] font-mono leading-none">Torque</p>
                  <p className="text-xs text-white font-bold mt-1">{ev.torque || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-[#1a1c20] p-4 rounded-xl border border-[#414750]/20 flex items-center gap-3">
                <div className="text-[#01c896] font-bold text-xs font-mono">0-100</div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#8b919b] font-mono leading-none">Accel</p>
                  <p className="text-xs text-white font-bold mt-1">{ev.acceleration || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-[#1a1c20] p-4 rounded-xl border border-[#414750]/20 flex items-center gap-3">
                <div className="text-[#ff5c5c] font-bold text-xs font-mono">Seat</div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#8b919b] font-mono leading-none">Seating</p>
                  <p className="text-xs text-white font-bold mt-1">{ev.seatingCapacity} Seats</p>
                </div>
              </div>

            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => onAddToCompare(ev)}
                className={`flex-1 py-3.5 px-6 font-bold text-xs sm:text-sm rounded-xl border uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 ${
                  isAdded 
                    ? 'text-[#00C896] border-[#00C896] bg-[#00C896]/10' 
                    : 'text-[#e2e2e8] border-[#414750] hover:bg-[#1a1c20] hover:border-[#8b919b]'
                }`}
              >
                {isAdded ? 'Added to COMPARE Basket' : 'Add to Compare Basket'}
              </button>
              
              <button 
                onClick={() => setShowBookingModal(true)}
                className="flex-1 py-3.5 px-6 font-bold text-xs sm:text-sm rounded-xl bg-[#00C896] text-[#002116] hover:bg-[#00e3aa] uppercase tracking-wider transition-all text-center"
                id="book-test-drive-btn"
              >
                Book Test Drive
              </button>
            </div>

          </div>

        </div>

        {/* 2. State-Driven Subsidy and RTO On-Road Price Estimator Section */}
        <section className="bg-[#1a1c20] border border-[#414750]/30 rounded-2xl p-6 sm:p-8 mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#414750]/20">
            <div>
              <span className="text-xs font-bold text-[#9acbff] uppercase tracking-wider font-mono">Pricing Calculators</span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-sans mt-1">
                Subsidized On-Road Cost Estimator ({selectedCity})
              </h3>
            </div>
            
            <span className="text-xs text-[#8b919b] font-mono bg-[#111317] py-2 px-3 rounded-xl border border-[#414750]/15">
              💡 Road Tax and Subsidy calculations auto-update based on your navbar selected city.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pt-6">
            <div className="md:col-span-3 space-y-4">
              <p className="text-xs text-[#8b919b] leading-relaxed">
                Most states in India incentivize the transition to zero-emissions by slashing or completely waiving standard road transit taxes. Under the active RTO guidelines for <span className="text-white font-bold">{selectedCity}</span>:
              </p>
              
              <ul className="space-y-2 text-xs text-[#c0c7d1]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#00C896] rounded-full"></span>
                  <span>State EV Subsidy: <strong className="text-white">₹{costSummary.subsidy} Lakh</strong> applied directly at invoice registry.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#00C896] rounded-full"></span>
                  <span>RTO registration fees are heavily discounted to <strong className="text-white">₹{costSummary.rto} Lakh</strong>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#00C896] rounded-full"></span>
                  <span>Insurance buffer estimates reflect high-liability coverages.</span>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 bg-[#111317] p-5 rounded-xl border border-[#414750]/25 space-y-3 font-mono">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8b919b] border-b border-[#414750]/20 pb-2">Line-Item Breakdown</p>
              
              <div className="flex justify-between text-xs text-[#c0c7d1]">
                <span>Ex-Showroom Base:</span>
                <span>₹{costSummary.exShowroom} L</span>
              </div>
              <div className="flex justify-between text-xs text-[#c0c7d1]">
                <span>Estimated RTO Registration:</span>
                <span className="text-green-400 font-bold">+ ₹{costSummary.rto} L</span>
              </div>
              <div className="flex justify-between text-xs text-[#c0c7d1]">
                <span>Insurance Estimate:</span>
                <span>+ ₹{costSummary.insurance} L</span>
              </div>
              <div className="flex justify-between text-xs text-red-400">
                <span>State FAME EV Subsidy:</span>
                <span className="font-bold">- ₹{costSummary.subsidy} L</span>
              </div>

              <div className="border-t border-[#414750]/40 pt-3 flex justify-between text-sm text-white font-bold">
                <span>True Subsidized Total:</span>
                <span className="text-[#00C896]">₹{costSummary.onRoad} Lakh*</span>
              </div>
              <p className="text-[9px] text-[#8b919b] leading-none mt-2">*Note: Excludes specific dealership logistics or fast home installation grid extras.</p>
            </div>
          </div>
        </section>

        {/* 2B. Interactive Financial & Savings Toolkit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12" id="financial-savings-toolkit">
          
          {/* Monthly EMI Calculator Component */}
          <div className="bg-[#1a1c20] border border-[#414750]/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between" id="emi-calculator">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-[#414750]/20">
                <div className="bg-[#9acbff]/10 p-2.5 rounded-xl">
                  <Calculator className="w-5 h-5 text-[#9acbff]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#9acbff] uppercase tracking-wider font-mono">Affordability Partner</span>
                  <h3 className="text-lg font-extrabold text-white font-sans mt-0.5">
                    Monthly EMI Finance Estimator
                  </h3>
                </div>
              </div>

              <div className="space-y-6 pt-6 mb-8">
                {/* Vehicle Cost Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[#8b919b] font-medium">Vehicle Funding Price</label>
                    <span className="text-white font-mono font-bold">₹{emiPrice.toFixed(2)} Lakhs</span>
                  </div>
                  <input
                    type="range"
                    min={(ev.priceMin * 0.75).toFixed(1)}
                    max={(ev.priceMax ? ev.priceMax * 1.3 : ev.priceMin * 1.5).toFixed(1)}
                    step="0.1"
                    value={emiPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setEmiPrice(val);
                      if (downPayment > val) setDownPayment(parseFloat((val * 0.2).toFixed(2)));
                    }}
                    className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#9acbff]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                    <span>Min: ₹{(ev.priceMin * 0.75).toFixed(1)} L</span>
                    <span>Max: ₹{(ev.priceMax ? ev.priceMax * 1.3 : ev.priceMin * 1.5).toFixed(1)} L</span>
                  </div>
                </div>

                {/* Down Payment Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[#8b919b] font-medium">Down Payment Amount</label>
                    <span className="text-white font-mono font-bold">
                      ₹{clampedDownPayment.toFixed(2)} Lakhs ({emiPrice > 0 ? ((clampedDownPayment / emiPrice) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={emiPrice}
                    step="0.1"
                    value={clampedDownPayment}
                    onChange={(e) => setDownPayment(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#9acbff]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                    <span>₹0 L (0%)</span>
                    <span>Max: ₹{emiPrice.toFixed(2)} L (100%)</span>
                  </div>
                </div>

                {/* Annual Interest Rate Selection & Tenure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Interest Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-[#8b919b] font-medium">Interest Rate (p.a.)</label>
                      <span className="text-white font-mono font-bold">{interestRate.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="15"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#9acbff]"
                    />
                    <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                      <span>5%</span>
                      <span>15%</span>
                    </div>
                  </div>

                  {/* Tenure Term */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-[#8b919b] font-medium">Loan Tenure</label>
                      <span className="text-white font-mono font-bold">{tenureYears} Years ({tenureYears * 12} Mos)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      step="1"
                      value={tenureYears}
                      onChange={(e) => setTenureYears(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#9acbff]"
                    />
                    <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                      <span>1 Yr</span>
                      <span>7 Yrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Results Display Panel */}
            <div className="bg-[#111317] p-5 rounded-xl border border-[#414750]/25 space-y-4">
              <div className="flex flex-col items-center justify-center text-center py-2">
                <span className="text-[10px] uppercase font-bold text-[#8b919b] tracking-wider font-mono">Estimated Monthly Payment</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#9acbff] tracking-tight mt-1 font-sans">
                  ₹{Math.round(emi).toLocaleString('en-IN')} <span className="text-xs text-[#8b919b] font-normal">/ month</span>
                </span>
              </div>

              <div className="border-t border-[#414750]/20 pt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                <div>
                  <span className="text-[#8b919b] block font-sans">Principal Amount</span>
                  <span className="text-white font-bold block mt-0.5">₹{loanAmountLakhs.toFixed(2)} L</span>
                </div>
                <div className="border-x border-[#414750]/15">
                  <span className="text-[#8b919b] block font-sans">Total Interest</span>
                  <span className="text-[#00C896] font-bold block mt-0.5">₹{(totalInterest / 100000).toFixed(2)} L</span>
                </div>
                <div>
                  <span className="text-[#8b919b] block font-sans">Total Repayable</span>
                  <span className="text-white font-bold block mt-0.5">₹{(totalRepayment / 100000).toFixed(2)} L</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Cost Calculator Component */}
          <div className="bg-[#1a1c20] border border-[#414750]/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between" id="savings-calculator">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-[#414750]/20">
                <div className="bg-[#00C896]/10 p-2.5 rounded-xl">
                  <Coins className="w-5 h-5 text-[#00C896]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#00C896] uppercase tracking-wider font-mono">Savings Calculator</span>
                  <h3 className="text-lg font-extrabold text-white font-sans mt-0.5">
                    Operating Cost & Savings Calculator
                  </h3>
                </div>
              </div>

              <div className="space-y-5 pt-6 mb-8">
                {/* Daily Commute Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[#8b919b] font-medium">Daily Commute Distance</label>
                    <span className="text-white font-mono font-bold">{commuteDistance} km / day</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={commuteDistance}
                    onChange={(e) => setCommuteDistance(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#00C896]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                    <span>5 km</span>
                    <span>200 km</span>
                  </div>
                </div>

                {/* Local Electricity Grid Rate & Fuel Price Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Electricity Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-[#8b919b] font-medium">Electricity Grid Rate</label>
                      <span className="text-white font-mono font-bold">₹{electricityRate} / kWh</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      step="1"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#00C896]"
                    />
                    <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                      <span>₹3</span>
                      <span>₹15</span>
                    </div>
                  </div>

                  {/* ICE Fuel Price */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-[#8b919b] font-medium">ICE Fuel Price (Petrol/Diesel)</label>
                      <span className="text-white font-mono font-bold">₹{fuelPrice} / L</span>
                    </div>
                    <input
                      type="range"
                      min="85"
                      max="120"
                      step="1"
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#00C896]"
                    />
                    <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                      <span>₹85</span>
                      <span>₹120</span>
                    </div>
                  </div>
                </div>

                {/* ICE Mileage Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[#8b919b] font-medium">Equivalent ICE Vehicle Mileage</label>
                    <span className="text-white font-mono font-bold">{iceMileage} km / Liter</span>
                  </div>
                  <input
                    type="range"
                    min={ev.category === 'scooters' || ev.category === 'bikes' ? 30 : 8}
                    max={ev.category === 'scooters' || ev.category === 'bikes' ? 80 : 25}
                    step="1"
                    value={iceMileage}
                    onChange={(e) => setIceMileage(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#00C896]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                    <span>{ev.category === 'scooters' || ev.category === 'bikes' ? "30 km/L" : "8 km/L"}</span>
                    <span>{ev.category === 'scooters' || ev.category === 'bikes' ? "80 km/L" : "25 km/L"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating savings results dashboard */}
            <div className="bg-[#111317] p-5 rounded-xl border border-[#414750]/25 space-y-4">
              
              {/* Cost bar side-by-side indicator */}
              <div className="space-y-2 text-xs">
                {/* Cost bar comparison - ICE cost */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-red-400">ICE Monthly Cost</span>
                    <span className="text-white font-bold">₹{Math.round(iceMonthlyCost).toLocaleString('en-IN')}</span>
                  </div>
                  {/* Bar */}
                  <div className="w-full bg-red-950/20 h-2 rounded-full overflow-hidden border border-red-500/10">
                    <div className="bg-red-500 h-full rounded-full transition-all" style={{ width: '100%' }}></div>
                  </div>
                </div>

                {/* Cost bar comparison - EV cost */}
                <div className="space-y-1 mt-3">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[#00C896]">This EV Monthly Cost</span>
                    <span className="text-white font-bold">
                      ₹{Math.round(evMonthlyCost).toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-[#8b919b] font-normal">
                        ({(evEfficiency * 1000).toFixed(0)} Wh/km efficiency)
                      </span>
                    </span>
                  </div>
                  {/* Bar */}
                  <div className="w-full bg-[#1a1c20] h-2 rounded-full overflow-hidden border border-[#414750]/20">
                    <div className="bg-[#00C896] h-full rounded-full transition-all text-[10px]" style={{ width: `${Math.min(100, Math.max(5, (evMonthlyCost / (iceMonthlyCost || 1)) * 100))}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Glowing Monthly & Annual Savings card */}
              <div className="border-t border-[#414750]/20 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8b919b] tracking-wider font-mono block">Estimated Monthly Savings</span>
                  <span className="text-xl font-extrabold text-[#00C896] tracking-tight block">
                    ₹{Math.round(monthlySavings).toLocaleString('en-IN')} <span className="text-xs font-normal">/ mo</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#8b919b] tracking-wider font-mono block">Annualized Savings</span>
                  <span className="text-base font-bold text-[#ffb86f] block">
                    + ₹{Math.round(annualSavings).toLocaleString('en-IN')} <span className="text-[10px] font-normal">/ yr</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Detailed Specification Table Checklist Sheet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          
          {/* Detailed Full spec sheet columns */}
          <div className="bg-[#1a1c20]/45 p-6 rounded-2xl border border-[#414750]/20 md:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2 border-b border-[#414750]/25 pb-3">
              <ClipboardList className="w-5 h-5 text-[#9acbff]" />
              Detailed Spec Sheet
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-[#414750]/10">
                <span className="text-[#8b919b]">Category Segmentation</span>
                <span className="text-white capitalize font-bold">{ev.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#414750]/10">
                <span className="text-[#8b919b]">Battery Capacity</span>
                <span className="text-white font-semibold">{ev.battery}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#414750]/10">
                <span className="text-[#8b919b]">Power</span>
                <span className="text-white font-semibold">{ev.power}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#414750]/10">
                <span className="text-[#8b919b]">Torque</span>
                <span className="text-white font-semibold">{ev.torque || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#414750]/10">
                <span className="text-[#8b919b]">Home Charging</span>
                <span className="text-white font-semibold">{ev.chargingAC || 'N/A (Standard 15A)'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#414750]/10">
                <span className="text-[#8b919b]">Fast Charging</span>
                <span className="text-white font-semibold">{ev.chargingDC || ev.chargingTime}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#414750]/10">
                <span className="text-[#8b919b]">Top Speed</span>
                <span className="text-white font-semibold">{ev.topSpeed || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Pros & Cons Columns checklist panels */}
          <div className="space-y-6">
            
            <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/25 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-green-400 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-400" />
                The Pros
              </h4>
              <ul className="space-y-3">
                {ev.pros.map((pro, idx) => (
                  <li key={idx} className="text-xs text-[#c0c7d1] flex items-start gap-2.5 leading-relaxed">
                    <span className="text-green-500 mt-0.5 font-bold flex-shrink-0">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/25 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-red-400" />
                The Cons
              </h4>
              <ul className="space-y-3">
                {ev.cons.map((con, idx) => (
                  <li key={idx} className="text-xs text-[#c0c7d1] flex items-start gap-2.5 leading-relaxed">
                    <span className="text-red-500 mt-0.5 font-bold flex-shrink-0">❌</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Variants & Pricing Table */}
        {ev.variants && ev.variants.length > 0 && (
          <div className="mt-12 bg-[#1a1c20] border border-[#414750]/30 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-extrabold text-white font-sans flex items-center gap-2 border-b border-[#414750]/25 pb-3 mb-4">
              <ClipboardList className="w-5 h-5 text-[#9acbff]" />
              Variants & Pricing (Ex-Showroom)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#e2e2e8]">
                <thead className="bg-[#111317] border-b border-[#414750]/30 font-mono text-xs text-[#8b919b] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-medium">Variant Name</th>
                    <th className="px-4 py-3 font-medium text-right">Price (Lakhs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#414750]/20 font-sans">
                  {ev.variants.map((variant, idx) => (
                    <tr key={idx} className="hover:bg-[#111317]/50 transition-colors">
                      <td className="px-4 py-3 font-semibold">{variant.variantName}</td>
                      <td className="px-4 py-3 text-right text-[#00C896] font-bold">₹{variant.price} L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Booking Form Dialog Drawer component Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" id="booking-modal">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowBookingModal(false)}
          ></div>

          <div className="bg-[#1a1c20] border border-[#414750] w-full max-w-lg rounded-2xl overflow-hidden relative z-10 p-6 sm:p-8 shadow-2xl">
            
            {bookingSubmitted ? (
              <div className="text-center py-8 space-y-4 flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-[#00C896] animate-bounce" />
                <h3 className="text-2xl font-bold text-white tracking-tight">Test Drive Scheduled!</h3>
                <p className="text-xs text-[#8b919b] max-w-sm leading-relaxed">
                  Success! A booking representative from our {selectedCity} certified flagship hub has allocated a <strong className="text-white">{ev.name}</strong> for you.
                </p>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingSubmitted(false);
                  }}
                  className="mt-6 w-full py-3 bg-[#111317] hover:bg-[#282a2e] text-xs font-bold text-[#c0c7d1], rounded-xl uppercase tracking-wider transition-all"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">Schedule Your Certified Test Drive</h3>
                  <p className="text-xs text-[#8b919b] mt-1.5 leading-relaxed">
                    Submit your details to experience the {ev.name} first-hand in {selectedCity}. Zero obligation. Includes a complimentary home standard wallbox charger audit report.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Your First & Last Name"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                      className="w-full bg-[#111317] border border-[#414750] rounded-xl py-3 pl-10 pr-4 text-xs text-[#e2e2e8] focus:border-[#00C896] focus:outline-none transition-all"
                    />
                    <User className="w-4 h-4 text-[#8b919b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="Your Mobile Phone Number"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                      className="w-full bg-[#111317] border border-[#414750] rounded-xl py-3 pl-10 pr-4 text-xs text-[#e2e2e8] focus:border-[#00C896] focus:outline-none transition-all"
                    />
                    <Phone className="w-4 h-4 text-[#8b919b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>


                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={bookingForm.preferredDate}
                      onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                      className="w-full bg-[#111317] border border-[#414750] rounded-xl py-3 pl-10 pr-4 text-xs text-[#e2e2e8] focus:border-[#00C896] focus:outline-none transition-all"
                    />
                    <Calendar className="w-4 h-4 text-[#8b919b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 py-3 bg-[#111317] hover:bg-[#282a2e] text-xs font-bold text-[#c0c7d1] rounded-xl uppercase tracking-wider transition-all text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#00C896] text-[#002116] hover:bg-[#00e3aa] text-xs font-bold rounded-xl uppercase tracking-wider transition-all text-center"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
