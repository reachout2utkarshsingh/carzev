import React from 'react';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { PageType } from '../types';

interface PrivacyViewProps {
  setCurrentPage: (page: PageType) => void;
}

export default function PrivacyView({ setCurrentPage }: PrivacyViewProps) {
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
            <div className="bg-[#00C896]/10 p-3 rounded-xl text-[#00C896]">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-[#8b919b] mt-1 font-mono">Last Updated: June 5, 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-[#c0c7d1] leading-relaxed">
            <p>
              At <strong>CARZev</strong>, accessible from <code>carzev.in</code>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by CARZev and how we use it.
            </p>

            <h2 className="text-lg font-bold text-white mt-8 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#9acbff]" />
              1. Information We Collect
            </h2>
            <p>
              If you contact us directly or request assistance, we may receive additional information about you. Specifically:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Personal Inquiries & Forms</strong>: When you request a consultation or book a certified test drive, we ask for your contact information, including your <strong>Name</strong> and <strong>Phone Number</strong>.</li>
              <li><strong>Local Preferences</strong>: We store your selected city locally in your browser to deliver customized RTO tax calculations, local FAME incentives, and nearby test drive hub parameters.</li>
            </ul>

            <h2 className="text-lg font-bold text-white mt-8 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#9acbff]" />
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, operate, and maintain our database services, EMI calculations, and savings comparison metrics.</li>
              <li>Improve, personalize, and expand our information listings and user experiences.</li>
              <li>Understand and analyze how you interact with our tools and sliders.</li>
              <li>Communicate with you to schedule requested test drives or EV owner/buyer consultations.</li>
              <li>Securely store consultation and test drive registrations in our Firebase cloud infrastructure.</li>
            </ul>

            <h2 className="text-lg font-bold text-white mt-8 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#9acbff]" />
              3. Data Retention and Partner Sharing
            </h2>
            <p>
              We only share your submitted contact details (Name and Phone Number) with authorized vehicle dealerships or certified consultation professionals explicitly to fulfill your test drive or consulting request. We do not sell, rent, or lease your personal information to third-party marketing companies. All data transactions are encrypted and stored using secure Firebase database platforms.
            </p>

            <h2 className="text-lg font-bold text-white mt-8">
              4. Consent
            </h2>
            <p>
              By using our website, you hereby consent to our Privacy Policy and agree to its terms.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
