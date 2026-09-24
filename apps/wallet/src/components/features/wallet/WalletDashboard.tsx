import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { TrustBadge } from '../../ui/TrustBadge';
import { IncomingRequestCard } from './IncomingRequestCard';
import { CredentialsList } from './CredentialsList';
import { AuditReceiptsList } from './AuditReceiptsList';
import { VerificationRequest, CredentialClaim, AuditReceipt } from '../../../types/protocol';
import { MOCK_CITIZEN_WALLET } from '../../../data/mockData';
import { User, ShieldCheck, FileCheck, History, Settings, Lock, Inbox } from 'lucide-react';

export interface WalletDashboardProps {
  requests: VerificationRequest[];
  credentials: CredentialClaim[];
  receipts: AuditReceipt[];
  onReviewRequest: (request: VerificationRequest) => void;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({
  requests,
  credentials,
  receipts,
  onReviewRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'credentials' | 'receipts' | 'settings'>(
    'requests',
  );

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Wallet Shell Header */}
      <Card variant="accent" className="border-indigo-500/40 bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{MOCK_CITIZEN_WALLET.name}</h2>
                <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  Hardware Enclave Ready
                </Badge>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                {MOCK_CITIZEN_WALLET.walletDid}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TrustBadge type="non-custodial" />
            <TrustBadge type="bbs-tier-a" />
            <TrustBadge type="zero-pii" />
          </div>
        </div>
      </Card>

      {/* Main Wallet Navigation Pill Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === 'requests'
              ? 'bg-[#0a1317] text-white border-[#0a1317]'
              : 'bg-white text-[#1c1e21] border-[#ced0d4] hover:bg-[#f1f4f7]'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Pending Requests</span>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#fef7e0] text-[#b06000] font-bold text-xs border border-[#feefc3]">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === 'credentials'
              ? 'bg-[#0a1317] text-white border-[#0a1317]'
              : 'bg-white text-[#1c1e21] border-[#ced0d4] hover:bg-[#f1f4f7]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Certified Credentials ({credentials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === 'receipts'
              ? 'bg-[#0a1317] text-white border-[#0a1317]'
              : 'bg-white text-[#1c1e21] border-[#ced0d4] hover:bg-[#f1f4f7]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Receipts ({receipts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === 'settings'
              ? 'bg-[#0a1317] text-white border-[#0a1317]'
              : 'bg-white text-[#1c1e21] border-[#ced0d4] hover:bg-[#f1f4f7]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Wallet Enclave</span>
        </button>
      </div>

      {/* Tab Content Areas */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Incoming Verification Requests</h3>
            <span className="text-xs text-slate-400">
              Only signed requests from verified institutions appear here
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <Card variant="subtle" className="text-center py-12 text-slate-400">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-200">No Pending Requests</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Use the Verifier Console or Live Demo to generate a new verification request.
              </p>
            </Card>
          ) : (
            pendingRequests.map((req) => (
              <IncomingRequestCard key={req.id} request={req} onReview={onReviewRequest} />
            ))
          )}
        </div>
      )}

      {activeTab === 'credentials' && <CredentialsList credentials={credentials} />}

      {activeTab === 'receipts' && <AuditReceiptsList receipts={receipts} />}

      {activeTab === 'settings' && (
        <Card variant="default" className="space-y-4 max-w-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>Non-Custodial Enclave Security</span>
          </h3>
          <p className="text-xs text-slate-300">
            This wallet operates under the Āśraya Non-Custodial Architecture. All cryptographic keys
            are bound to device Keystore/WebCrypto hardware.
          </p>

          <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Holder DID:</span>
              <span className="text-indigo-300">{MOCK_CITIZEN_WALLET.walletDid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tier A Engine:</span>
              <span className="text-emerald-400">BBS+ Selective Disclosure (Active)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tier B Engine:</span>
              <span className="text-indigo-300">Groth16 ZK Circuit Fallback (Supported)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Data Minimization Invariant:</span>
              <span className="text-emerald-400 font-bold">0 Raw Attributes Shared</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
