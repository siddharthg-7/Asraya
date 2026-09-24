import React from 'react';
import { ShieldCheck, Lock, Cpu, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-[#dee3e9] py-12 mt-16 text-[#5d6c7b] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[#0a1317] font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#0064e0]" />
            <span>ĀŚRAYA / PRAMĀṆA PROTOCOL</span>
          </div>
          <p className="text-[#5d6c7b] text-xs max-w-md">
            Privacy-Preserving Digital Verification Infrastructure. Eliminating wholesale PII ingestion through BBS+ Selective Disclosure and Zero-Knowledge Predicates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[#1c1e21] text-xs font-bold">
          <div className="flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-[#137333]" />
            <span>Zero Raw PII Storage</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#0064e0]" />
            <span>Non-Custodial Enclave</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0a1317]" />
            <span>W3C VC & BBS Standard</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-[#dee3e9] text-center text-[#8595a4] text-[11px]">
        Official Demonstration Platform — Pramāṇa Architectural Specification Reference Implementation.
      </div>
    </footer>
  );
};

