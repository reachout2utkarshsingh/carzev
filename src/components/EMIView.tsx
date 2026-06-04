import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, HelpCircle, CheckCircle, CreditCard, ChevronRight } from 'lucide-react';
import { EVModel, PageType } from '../types';
import { evModels } from '../data/evData';

interface EMIViewProps {
  setCurrentPage: (page: PageType) => void;
  onSelectEV: (evId: string) => void;
  selectedCity: string;
}

export default function EMIView({ setCurrentPage, onSelectEV, selectedCity }: EMIViewProps) {
  // Preset select models
  const [selectedEvId, setSelectedEvId] = useState<string>('custom');
  const [vehiclePrice, setVehiclePrice] = useState<number>(15.0); // in Lakhs
  const [downPayment, setDownPayment] = useState<number>(3.0); // in Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5); // % p.a.
  const [tenureYears, setTenureYears] = useState<number>(5); // years

  // Sync price when different EV is selected
  useEffect(() => {
    if (selectedEvId !== 'custom') {
      const selectedEv = evModels.find(e => e.id === selectedEvId);
      if (selectedEv) {
        setVehiclePrice(selectedEv.priceMin);
        setDownPayment(parseFloat((selectedEv.priceMin * 0.2).toFixed(2)));
      }
    }
  }, [selectedEvId]);

  // Derived loan math
  const clampedDownPayment = Math.min(downPayment, vehiclePrice);
  const loanAmountLakhs = Math.max(0, vehiclePrice - clampedDownPayment);
  const loanAmountRupees = loanAmountLakhs * 100000;

  const calculateFinance = () => {
    const R = interestRate;
    const r = R / (12 * 100);
    const n = tenureYears * 12;

    if (loanAmountRupees <= 0) {
      return { emi: 0, totalInterest: 0, totalRepayment: 0 };
    }
    if (r === 0) {
      return { emi: loanAmountRupees / n, totalInterest: 0, totalRepayment: loanAmountRupees };
    }

    const emiVal = (loanAmountRupees * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalRepaymentVal = emiVal * n;
    const totalInterestVal = totalRepaymentVal - loanAmountRupees;

    return {
      emi: emiVal,
      totalInterest: totalInterestVal,
      totalRepayment: totalRepaymentVal
    };
  };

  const { emi, totalInterest, totalRepayment } = calculateFinance();

  // Create table rows for standard 12-month interval overview principal vs interest
  const getRepaymentScheduleList = () => {
    const schedule = [];
    let balance = loanAmountRupees;
    const R = interestRate;
    const r = R / (12 * 100);
    const n = tenureYears * 12;

    if (balance <= 0 || emi <= 0) return [];

    for (let year = 1; year <= tenureYears; year++) {
      let interestPaidThisYear = 0;
      let principalPaidThisYear = 0;

      for (let month = 1; month <= 12; month++) {
        const interestPaidThisMonth = balance * r;
        const principalPaidThisMonth = emi - interestPaidThisMonth;
        balance = Math.max(0, balance - principalPaidThisMonth);
        interestPaidThisYear += interestPaidThisMonth;
        principalPaidThisYear += principalPaidThisMonth;
      }

      schedule.push({
        year,
        principalPaid: principalPaidThisYear,
        interestPaid: interestPaidThisYear,
        remainingBalance: balance
      });
    }
    return schedule;
  };

  const yearlySchedule = getRepaymentScheduleList();

  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="emi-calculator-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Title */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-sm font-semibold text-[#8b919b] hover:text-[#9acbff] transition-colors mb-3"
            id="back-to-home-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#9acbff] uppercase tracking-wider font-mono">FINANCE LABS</span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans mt-0.5">
                On-Road EMI Estimator
              </h1>
              <p className="text-xs text-[#8b919b] mt-1 font-mono">
                Analyze down payments, monthly obligations, and total ownership costs instantly
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-[#1a1c20] px-4 py-2 rounded-xl border border-[#414750]/30 h-fit text-xs font-mono">
              <span className="text-[#8b919b]">Market Pricing City:</span>
              <span className="text-[#00C896] font-bold uppercase">{selectedCity}</span>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* A. Form inputs container */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1a1c20] p-6 sm:p-8 rounded-2xl border border-[#414750]/30 space-y-6" id="calculator-inputs">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#414750]/15">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#9acbff]" />
                  Calculator Coefficients
                </span>
                <span className="text-[10px] text-[#8b919b] font-mono">2026-06-03 UPDATE</span>
              </div>

              {/* Quick Select EV Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8b919b] uppercase tracking-wider block">Pre-fill from EV Database</label>
                <select
                  value={selectedEvId}
                  onChange={(e) => setSelectedEvId(e.target.value)}
                  className="w-full bg-[#111317] border border-[#414750]/60 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#9acbff] cursor-pointer"
                  id="ev-preset-select"
                >
                  <option value="custom">-- Custom Price / Manual Input --</option>
                  {evModels.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.brand} {ev.name} (Starts ₹{ev.priceMin}L)
                    </option>
                  ))}
                </select>
              </div>

              {/* Slider 1: Vehicle Price */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-[#8b919b] font-medium">Vehicle Funding Price</label>
                  <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                    ₹ {vehiclePrice.toFixed(2)} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  step="0.5"
                  value={vehiclePrice}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVehiclePrice(v);
                    setSelectedEvId('custom');
                    if (downPayment > v) {
                      setDownPayment(parseFloat((v * 0.2).toFixed(2)));
                    }
                  }}
                  className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#9acbff]"
                  id="ip-vehicle-price"
                />
                <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                  <span>₹ 1.0 Lakh</span>
                  <span>₹ 120.0 Lakhs</span>
                </div>
              </div>

              {/* Slider 2: Down Payment */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-[#8b919b] font-medium">Down Payment Amount</label>
                  <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                    ₹ {clampedDownPayment.toFixed(2)} Lakhs ({vehiclePrice > 0 ? ((clampedDownPayment / vehiclePrice) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={vehiclePrice}
                  step="0.1"
                  value={clampedDownPayment}
                  onChange={(e) => setDownPayment(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#9acbff]"
                  id="ip-down-payment"
                />
                <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                  <span>₹ 0 L (0%)</span>
                  <span>Max: ₹ {vehiclePrice.toFixed(2)} L (100%)</span>
                </div>
              </div>

              {/* Row: Interest Rate & Tenure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Interest Rate */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[#8b919b] font-medium">Interest Rate (p.a.)</label>
                    <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                      {interestRate.toFixed(1)} %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#9acbff]"
                    id="ip-interest-rate"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                    <span>5.0%</span>
                    <span>15.0%</span>
                  </div>
                </div>

                {/* Tenure Years */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[#8b919b] font-medium">Loan Term Length</label>
                    <span className="text-white font-mono font-bold text-sm bg-[#111317] py-1 px-3 rounded-md border border-[#414750]/20">
                      {tenureYears} Years ({tenureYears * 12} Mos)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#111317] rounded-lg appearance-none cursor-pointer accent-[#9acbff]"
                    id="ip-tenure"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b919b] font-mono">
                    <span>1 Year</span>
                    <span>7 Years</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Repayment Schedule Overview */}
            {yearlySchedule.length > 0 && (
              <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/30">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span className="bg-[#9acbff]/10 p-1.5 rounded-lg text-[#9acbff] text-xs font-mono">STEP-WISE</span>
                  Amortization Repayment Balance Chart
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#414750]/30 text-[#8b919b]">
                        <th className="py-2.5">Year</th>
                        <th className="py-2.5 text-right">Principal Paid</th>
                        <th className="py-2.5 text-right">Interest Charged</th>
                        <th className="py-2.5 text-right">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#414750]/15">
                      {yearlySchedule.map((row) => (
                        <tr key={row.year} className="text-[#c0c7d1] hover:bg-[#1f2126] transition-all">
                          <td className="py-3 font-bold text-white">Year {row.year}</td>
                          <td className="py-3 text-right">₹ {Math.round(row.principalPaid).toLocaleString('en-IN')}</td>
                          <td className="py-3 text-right text-red-400">₹ {Math.round(row.interestPaid).toLocaleString('en-IN')}</td>
                          <td className="py-3 text-right text-[#00C896] font-bold">₹ {Math.round(row.remainingBalance).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* B. Sticky summary display sidebar panel */}
          <div className="space-y-6">
            <div className="bg-[#1a1c20] border border-[#414750]/40 rounded-2xl p-6 sm:p-8 space-y-6 sticky top-24 shadow-2xl" id="calculator-results-pane">
              
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-[#8b919b] tracking-widest font-mono">Computed Cost Profile</span>
                <p className="text-xs text-[#8b919b] mt-1">Estimations computed in compliance with retail banking standards.</p>
              </div>

              {/* Main Glowing EMI Stat */}
              <div className="bg-[#111317] border border-[#414750]/20 rounded-2xl p-6 text-center shadow-inner">
                <span className="text-[10px] uppercase font-extrabold text-[#9acbff] tracking-wider font-mono">ESTIMATED EMI</span>
                <h4 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1.5 font-sans">
                  ₹ {Math.round(emi).toLocaleString('en-IN')}
                </h4>
                <p className="text-xs text-[#8b919b] mt-1 font-mono">/ Month for {tenureYears * 12} Months</p>
              </div>

              {/* Breakdown Details */}
              <div className="space-y-3.5 pt-4 text-xs">
                
                <div className="flex justify-between items-center pb-3 border-b border-[#414750]/15">
                  <span className="text-[#8b919b]">Total Principal Borrowed</span>
                  <span className="text-white font-bold font-mono">₹ {loanAmountLakhs.toFixed(2)} Lakhs</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-[#414750]/15">
                  <span className="text-[#8b919b]">Capital Down Payment</span>
                  <span className="text-white font-bold font-mono">₹ {clampedDownPayment.toFixed(2)} Lakhs</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-[#414750]/15">
                  <span className="text-[#8b919b]">Total Interest Accrued</span>
                  <span className="text-red-400 font-bold font-mono">₹ {(totalInterest / 100000).toFixed(2)} Lakhs</span>
                </div>

                <div className="flex justify-between items-center pb-3">
                  <span className="text-[#8b919b]">Aggregate Repo Cost</span>
                  <span className="text-[#00C896] font-bold font-mono">₹ {(totalRepayment / 100000).toFixed(2)} Lakhs</span>
                </div>

              </div>

              {/* Warning/Assistance Disclaimer */}
              <div className="bg-[#24211a] border border-[#e19600]/20 p-4 rounded-xl flex gap-3 text-xs text-[#ffb86f]">
                <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Calculators use mathematical compounding. Final state RTO taxes, state registration, insurance fees, or loan processing costs depend on your credit eligibility.
                </p>
              </div>

              {/* Action Button: Prefill Booking Form */}
              {selectedEvId !== 'custom' && (
                <button
                  onClick={() => onSelectEV(selectedEvId)}
                  className="w-full bg-[#1b6ca8] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#114f7d] transition-all flex items-center justify-center gap-2 group shadow-lg"
                >
                  Book {evModels.find(e => e.id === selectedEvId)?.name} Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
