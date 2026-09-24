import React from 'react';
import { ShieldCheck } from 'lucide-react';

export type ActiveView = 'landing' | 'wallet' | 'verifier' | 'demo';

export interface AppHeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  pendingRequestsCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeView,
  setActiveView,
  pendingRequestsCount,
}) => {
  return (
    <header className="w-full bg-white border-b border-[#dee3e9] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title on Left */}
        <div
          onClick={() => setActiveView('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-[#0a1317] flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-[#0a1317] font-sans tracking-tight">
                ĀŚRAYA
              </span>
              <span className="text-[#5d6c7b] text-xs">/</span>
              <span className="text-xs font-mono font-semibold text-[#5d6c7b] uppercase tracking-wider">
                PRAMĀṆA PROTOCOL
              </span>
            </div>
            <p className="text-[11px] text-[#5d6c7b] hidden sm:block font-normal">
              Privacy-Preserving Verification Infrastructure
            </p>
          </div>
        </div>

        {/* Clean Meta Pill Navigation Links on Right */}
        <nav className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
          <button
            onClick={() => setActiveView('landing')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0064e0] ${
              activeView === 'landing'
                ? 'bg-[#0a1317] text-white border border-[#0a1317]'
                : 'bg-white text-[#1c1e21] border border-[#ced0d4] hover:bg-[#f1f4f7]'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveView('wallet')}
            className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0064e0] flex items-center space-x-1.5 ${
              activeView === 'wallet'
                ? 'bg-[#0a1317] text-white border border-[#0a1317]'
                : 'bg-white text-[#1c1e21] border border-[#ced0d4] hover:bg-[#f1f4f7]'
            }`}
          >
            <span>Citizen Wallet</span>
            {pendingRequestsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#fef7e0] text-[#b06000] font-bold text-[10px] border border-[#feefc3]">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('verifier')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0064e0] ${
              activeView === 'verifier'
                ? 'bg-[#0a1317] text-white border border-[#0a1317]'
                : 'bg-white text-[#1c1e21] border border-[#ced0d4] hover:bg-[#f1f4f7]'
            }`}
          >
            Verifier Console
          </button>

          <button
            onClick={() => setActiveView('demo')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0064e0] ${
              activeView === 'demo'
                ? 'bg-[#0064e0] text-white border border-[#0064e0]'
                : 'bg-[#0064e0] text-white hover:bg-[#0457cb] border border-[#0064e0]'
            }`}
          >
            Live Demo
          </button>
        </nav>
      </div>
    </header>
  );
};

