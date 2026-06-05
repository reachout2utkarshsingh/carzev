import React, { useState } from 'react';
import { User, Phone, CheckCircle, HelpCircle, Award, Star, BatteryCharging, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageType } from '../types';
import { addConsultationRequest } from '../lib/evService';

interface ConsultationViewProps {
  setCurrentPage: (page: PageType) => void;
  selectedCity: string;
}

export default function ConsultationView({ setCurrentPage, selectedCity }: ConsultationViewProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'new-buyer' // 'new-buyer' | 'ev-owner'
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setSubmitting(true);
    try {
      await addConsultationRequest({
        name: formData.name,
        phone: formData.phone,
        consultationType: formData.type,
        city: selectedCity
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to store consultation request:", error);
      alert("Failed to submit request. If your Firestore is in production mode, make sure you temporarily enabled writes in your Firestore rules!");
    } finally {
      setSubmitting(false);
    }
  };

  const newBuyerExperts = [
    {
      name: "Amit Verma",
      role: "Cost & Subsidy Advisor",
      specialty: "FAME-II, State Road-Tax Exclusions, Total Cost of Ownership (TCO) Modelling",
      experience: "8+ Years in Auto Finance",
      rating: 4.9,
      reviews: 142
    },
    {
      name: "Neha Sharma",
      role: "EV Selection Consultant",
      specialty: "EV Matchmaking, Range Requirements Analyser, Driving Dynamics Diagnostics",
      experience: "6+ Years in EV Technical Journalism",
      rating: 4.8,
      reviews: 96
    }
  ];

  const evOwnerExperts = [
    {
      name: "Vikram Malhotra",
      role: "Range & Battery Specialist",
      specialty: "Cell Health Optimization, Thermal Performance, Regenerative Braking Tuning",
      experience: "10+ Years in Battery Engineering",
      rating: 5.0,
      reviews: 210
    },
    {
      name: "Priyanka Rao",
      role: "Charging Infrastructure Engineer",
      specialty: "Home Charger Allocation, Residential Solar-EV Integrations, Smart Grid Audits",
      experience: "7+ Years in Charging Solutions",
      rating: 4.9,
      reviews: 118
    }
  ];

  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 text-xs font-bold text-[#8b919b] hover:text-white mb-6 uppercase tracking-wider transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#9acbff]" />
          Back to Home
        </button>

        {/* Hero Banner Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[#00C896] text-xs font-bold tracking-wider uppercase font-mono bg-[#00C896]/10 px-3 py-1 rounded-full">
            Expert Advisory Service
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans mt-3">
            Book a Consultation with Our EV Experts
          </h1>
          <p className="text-sm text-[#8b919b] leading-relaxed max-w-2xl mx-auto">
            Transitioning to electric mobility or optimizing your current EV experience should not be a guessing game. Speak to our certified engineering and policy advisory team in <strong className="text-white">{selectedCity}</strong>.
          </p>
        </div>

        {/* 2-Section Grid (EV Owners / New Buyers) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Section 1: For New Buyers */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#414750]/20 pb-4">
              <div className="p-2.5 bg-[#9acbff]/10 rounded-xl text-[#9acbff]">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-sans">For Aspiring & New Buyers</h2>
                <p className="text-xs text-[#8b919b] mt-0.5">Need help choosing your first electric vehicle?</p>
              </div>
            </div>

            <div className="space-y-4">
              {newBuyerExperts.map((exp, idx) => (
                <div key={idx} className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/20 flex gap-4 items-start hover:border-[#9acbff]/45 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[#111317] flex items-center justify-center font-bold text-[#9acbff] border border-[#414750]/30 flex-shrink-0 text-sm">
                    {exp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="text-sm font-bold text-white font-sans truncate">{exp.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{exp.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#9acbff] font-semibold leading-none">{exp.role}</p>
                    <p className="text-xs text-[#8b919b] leading-normal mt-1"><strong className="text-[#c0c7d1]">Specialty:</strong> {exp.specialty}</p>
                    <div className="flex gap-4 pt-2 text-[10px] text-[#8b919b] font-mono border-t border-[#414750]/10 mt-2">
                      <span>{exp.experience}</span>
                      <span>({exp.reviews} sessions completed)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: For EV Owners */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#414750]/20 pb-4">
              <div className="p-2.5 bg-[#00C896]/10 rounded-xl text-[#00C896]">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-sans">For Existing EV Owners</h2>
                <p className="text-xs text-[#8b919b] mt-0.5">Need range optimization or battery diagnostic support?</p>
              </div>
            </div>

            <div className="space-y-4">
              {evOwnerExperts.map((exp, idx) => (
                <div key={idx} className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/20 flex gap-4 items-start hover:border-[#00C896]/45 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[#111317] flex items-center justify-center font-bold text-[#00C896] border border-[#414750]/30 flex-shrink-0 text-sm">
                    {exp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="text-sm font-bold text-white font-sans truncate">{exp.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{exp.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#00C896] font-semibold leading-none">{exp.role}</p>
                    <p className="text-xs text-[#8b919b] leading-normal mt-1"><strong className="text-[#c0c7d1]">Specialty:</strong> {exp.specialty}</p>
                    <div className="flex gap-4 pt-2 text-[10px] text-[#8b919b] font-mono border-t border-[#414750]/10 mt-2">
                      <span>{exp.experience}</span>
                      <span>({exp.reviews} sessions completed)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Submit Form Component */}
        <div className="max-w-xl mx-auto bg-[#1a1c20] border border-[#414750]/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="consultation-form-section">
          {submitted ? (
            <div className="text-center py-8 space-y-4 flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-[#00C896] animate-bounce" />
              <h3 className="text-2xl font-bold text-white tracking-tight">Consultation Scheduled!</h3>
              <p className="text-xs text-[#8b919b] max-w-sm leading-relaxed mx-auto">
                Success! An expert from our <strong>{formData.type === 'new-buyer' ? 'EV Selection' : 'Battery & Infrastructure'}</strong> advisory team will contact you at <strong className="text-white">{formData.phone}</strong> within 2 hours.
              </p>
              <button
                onClick={() => {
                  setFormData({ name: '', phone: '', type: 'new-buyer' });
                  setSubmitted(false);
                }}
                className="mt-6 w-full py-3 bg-[#111317] hover:bg-[#282a2e] text-xs font-bold text-[#c0c7d1] rounded-xl uppercase tracking-wider transition-all"
              >
                Schedule Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Schedule Your Free Session</h3>
                <p className="text-xs text-[#8b919b] mt-1">Submit your number and a certified specialist will contact you.</p>
              </div>

              {/* Consultation profile tabs */}
              <div className="grid grid-cols-2 gap-2 bg-[#111317] p-1 rounded-xl border border-[#414750]/20">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'new-buyer' })}
                  className={`py-2 text-center text-xs font-bold rounded-lg transition-all ${
                    formData.type === 'new-buyer' 
                      ? 'bg-[#1b6ca8] text-white shadow-md' 
                      : 'text-[#8b919b] hover:text-white'
                  }`}
                >
                  I am a New Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'ev-owner' })}
                  className={`py-2 text-center text-xs font-bold rounded-lg transition-all ${
                    formData.type === 'ev-owner' 
                      ? 'bg-[#00C896] text-[#002116] shadow-md' 
                      : 'text-[#8b919b] hover:text-white'
                  }`}
                >
                  I am an EV Owner
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#111317] border border-[#414750] rounded-xl py-3 pl-10 pr-4 text-xs text-[#e2e2e8] focus:border-[#00C896] focus:outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-[#8b919b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number (e.g. +91 98765 43210)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#111317] border border-[#414750] rounded-xl py-3 pl-10 pr-4 text-xs text-[#e2e2e8] focus:border-[#00C896] focus:outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-[#8b919b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3.5 font-bold text-xs rounded-xl uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2 ${
                  formData.type === 'new-buyer' 
                    ? 'bg-[#1b6ca8] hover:bg-[#114f7d] text-white' 
                    : 'bg-[#00C896] hover:bg-[#00e3aa] text-[#002116]'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Submitting Request...' : (
                  <>
                    Confirm Advisory Request
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
