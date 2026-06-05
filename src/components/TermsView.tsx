import React from 'react';
import { BookOpen, Scale, AlertCircle, ArrowLeft } from 'lucide-react';
import { PageType } from '../types';

interface TermsViewProps {
  setCurrentPage: (page: PageType) => void;
}

export default function TermsView({ setCurrentPage }: TermsViewProps) {
  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back Button */}
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 text-xs font-bold text-[#8b919b] hover:text-white mb-8 uppercase tracking-wider transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#9acbff]" />
          Back to Home
        </button>

        <div className="bg-[#1a1c20] border border-[#414750]/30 rounded-2xl p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-4 border-b border-[#414750]/20 pb-6">
            <div className="bg-[#9acbff]/10 p-3 rounded-xl text-[#9acbff]">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Terms and Conditions</h1>
              <p className="text-xs text-[#8b919b] mt-1 font-mono">Last Updated: June 5, 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-[#c0c7d1] leading-relaxed">
            <p>
              Welcome to <strong>CARZev</strong>! These terms and conditions outline the rules and regulations for the use of CARZev's Website, located at <code>carzev.in</code>.
            </p>
            <p>
              By accessing this website, we assume you accept these terms and conditions. Do not continue to use CARZev if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h2 className="text-lg font-bold text-white mt-8 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#00C896]" />
              1. Informational Service Only
            </h2>
            <p>
              CARZev provides an informational database of electric vehicles (EVs) in India, including battery details, range estimates, power figures, and estimated pricing (including state-specific RTO taxes and subsidies). 
            </p>
            <p>
              While we strive to ensure that all specifications, ranges, and prices listed are as accurate and up-to-date as possible (relying on official automotive manufacturer homologation details and public ARAI listings), all parameters should be treated as <strong>indicative estimates</strong>. Actual range, pricing, and charging speeds vary based on real-world factors such as weather, driving conditions, and dealer packages.
            </p>

            <h2 className="text-lg font-bold text-white mt-8 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#00C896]" />
              2. User Requests (Consultations & Test Drives)
            </h2>
            <p>
              By submitting your Name and Phone Number through our Consultation or Test Drive forms, you authorize CARZev to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Store your request details securely in our database systems.</li>
              <li>Share your contact info with certified EV experts or brand dealerships to facilitate scheduling your requested service.</li>
            </ul>
            <p>
              You represent and warrant that the contact details you provide are accurate and belong to you.
            </p>

            <h2 className="text-lg font-bold text-white mt-8">
              3. Disclaimer of Liability
            </h2>
            <p>
              CARZev, its owners, and its operators shall not be held liable for any decisions, financial commitments, or purchases made based on the information provided by our calculators, comparison tools, or expert consulting team. We encourage users to verify final specifications and pricing directly with authorized manufacturer dealerships.
            </p>

            <h2 className="text-lg font-bold text-white mt-8">
              4. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. Your continued use of the site after any changes constitutes acceptance of the new Terms.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
