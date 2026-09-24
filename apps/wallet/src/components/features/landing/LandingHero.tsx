import React from 'react';
import { Button } from '../../ui/Button';
import { ActiveView } from '../../layout/AppHeader';
import { User, Building2, ShieldCheck, EyeOff, Lock, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface LandingHeroProps {
  onNavigate: (view: ActiveView) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigate }) => {
  return (
    <section className="pt-12 pb-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f1f4f7] border border-[#dee3e9] text-[#0064e0] text-xs font-mono font-bold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-[#0064e0]" />
            <span>Privacy-Preserving Verification Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-medium text-[#0a1317] tracking-tight leading-tight">
            Move the Question,<br />
            <span className="text-[#0064e0] font-bold">Not the Data.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#444950] leading-relaxed pt-1 max-w-2xl mx-auto">
            Verify eligibility and claims without requiring citizens to upload or expose their underlying personal documents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => onNavigate('wallet')}
              leftIcon={<User className="w-4 h-4 text-white" />}
            >
              Launch Citizen Wallet
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onClick={() => onNavigate('verifier')}
              leftIcon={<Building2 className="w-4 h-4 text-[#0a1317]" />}
            >
              Open Verifier Console
            </Button>
          </div>
        </div>

        {/* Product Principles Section (3 Clean Cards) */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5d6c7b] text-center">
            Privacy Infrastructure Principles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#dee3e9] rounded-3xl p-6 sm:p-8 space-y-3 shadow-none">
              <div className="flex items-center space-x-2 text-[#0064e0] font-bold text-sm">
                <EyeOff className="w-5 h-5 text-[#0064e0]" />
                <span>PRIVACY BY DESIGN</span>
              </div>
              <p className="text-xs sm:text-sm text-[#444950] leading-relaxed">
                Zero unnecessary raw PII. Only the requested bounded claim is verified. Underlying documents remain private.
              </p>
            </div>

            <div className="bg-white border border-[#dee3e9] rounded-3xl p-6 sm:p-8 space-y-3 shadow-none">
              <div className="flex items-center space-x-2 text-[#0064e0] font-bold text-sm">
                <Lock className="w-5 h-5 text-[#0064e0]" />
                <span>SELECTIVE DISCLOSURE</span>
              </div>
              <p className="text-xs sm:text-sm text-[#444950] leading-relaxed">
                Verifiers ask specific boolean questions (<code className="text-xs bg-[#f1f4f7] px-1.5 py-0.5 rounded text-[#0a1317]">Age &gt;= 18</code>, <code className="text-xs bg-[#f1f4f7] px-1.5 py-0.5 rounded text-[#0a1317]">Income &lt;= 3L</code>) instead of ingesting full records.
              </p>
            </div>

            <div className="bg-white border border-[#dee3e9] rounded-3xl p-6 sm:p-8 space-y-3 shadow-none">
              <div className="flex items-center space-x-2 text-[#0064e0] font-bold text-sm">
                <KeyRound className="w-5 h-5 text-[#0064e0]" />
                <span>NON-CUSTODIAL CONSENT</span>
              </div>
              <p className="text-xs sm:text-sm text-[#444950] leading-relaxed">
                Citizen wallet enclave controls cryptographic proof generation. Zero verifier tracking or global identifiers.
              </p>
            </div>
          </div>
        </div>

        {/* Problem vs. Solution Editorial Section */}
        <div className="bg-white border border-[#dee3e9] rounded-3xl p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-none">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#e41e3f] font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-[#e41e3f]" />
              <span>The Problem: Data Ingestion Vulnerability</span>
            </div>
            <p className="text-[#444950] text-xs sm:text-sm leading-relaxed">
              Conventional identity systems force citizens to upload full PDF scans, tax returns, and identity cards. Verifiers store DOBs, full names, and addresses indefinitely — creating massive surveillance honeypots exposed to catastrophic data breaches under DPDP & GDPR.
            </p>
          </div>

          <div className="space-y-3 md:border-l md:border-[#dee3e9] md:pl-8">
            <div className="flex items-center gap-2 text-[#31a24c] font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-[#31a24c]" />
              <span>The Āśraya Solution: Proof Minimization</span>
            </div>
            <p className="text-[#444950] text-xs sm:text-sm leading-relaxed">
              Verifiers dispatch signed predicate questions. The citizen's device evaluates certified claims locally and produces a zero-knowledge or selective disclosure proof. The verifier receives a 1-bit boolean answer — zero raw attributes saved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

