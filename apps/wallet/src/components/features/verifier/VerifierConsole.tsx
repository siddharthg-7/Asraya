import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { TrustBadge } from '../../ui/TrustBadge';
import { RequestBuilder } from './RequestBuilder';
import { MinimalAuditStorageView } from './MinimalAuditStorageView';
import { ZkBenchmarkPanel } from '../demo/ZkBenchmarkPanel';
import { SecurityAttackSimulator } from '../demo/SecurityAttackSimulator';
import { VerificationRequest, VerificationResult, VerifierAuditRecord, BoundedPredicate } from '../../../types/protocol';
import { Building2, ShieldCheck, CheckCircle2, PlayCircle, Cpu, ShieldAlert } from 'lucide-react';

export interface VerifierConsoleProps {
  requests: VerificationRequest[];
  auditRecords: VerifierAuditRecord[];
  lastResult: VerificationResult | null;
  onCreateRequest: (params: {
    verifierName: string;
    purpose: string;
    purposeCode: string;
    predicates: Omit<BoundedPredicate, 'id'>[];
  }) => Promise<void>;
  onSwitchToCitizenWallet: () => void;
}

export const VerifierConsole: React.FC<VerifierConsoleProps> = ({
  requests,
  auditRecords,
  lastResult,
  onCreateRequest,
  onSwitchToCitizenWallet,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'audit' | 'active' | 'benchmarks' | 'security'>('create');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Verifier Console Header */}
      <Card variant="accent" className="border-indigo-500/40 bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Verifier Portal & Pipeline</h2>
                <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  Zero-PII Storage Model Active
                </Badge>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                did:asraya:verifier:municipal-ev-dept
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TrustBadge type="zero-pii" />
            <button
              onClick={onSwitchToCitizenWallet}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Switch to Citizen View</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Verification Result Banner (if newly completed) */}
      {lastResult && (
        <Card variant="bordered" className="border-emerald-500/40 bg-emerald-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>LATEST VERIFICATION RESULT RECEIVED</span>
            </div>
            <span className="text-xs font-mono text-emerald-300">
              Verified: {new Date(lastResult.verifiedAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Verdict</span>
              <span className="text-emerald-400 font-bold text-sm">
                {lastResult.isSuccess ? 'VERIFIED (VALID PROOF)' : 'FAILED PROOF'}
              </span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Proof Engine Used</span>
              <span className="text-indigo-300 font-bold">{lastResult.tierUsed}</span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Raw Attributes Disclosed</span>
              <span className="text-emerald-400 font-bold text-sm">0 Attributes (ZERO PII)</span>
            </div>
          </div>

          {/* Predicate Answers Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Disclosed Bounded Answers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {lastResult.predicateResults.map((pr: { predicateId: string; label: string; satisfied: boolean }) => (
                <div
                  key={pr.predicateId}
                  className="p-2.5 bg-slate-950/90 rounded-lg border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-300 font-medium">{pr.label}</span>
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    {pr.satisfied ? 'PASSED (TRUE)' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Meta Pill Category Tabs */}
      <div className="flex gap-2 flex-wrap pb-2">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer border ${
            activeTab === 'create'
              ? 'bg-[#0a1317] text-white border-[#0a1317]'
              : 'bg-white text-[#1c1e21] border-[#ced0d4] hover:bg-[#f1f4f7]'
          }`}
        >
          Create Request
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer border ${
            activeTab === 'active'
              ? 'bg-[#0a1317] text-white border-[#0a1317]'
              : 'bg-white text-[#1c1e21] border-[#ced0d4] hover:bg-[#f1f4f7]'
          }`}
        >
          Active Sessions ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer border ${
            activeTab === 'audit'
              ? 'bg-[#0a1317] text-white border-[#0a1317]'
              : 'bg-white text-[#1c1e21] border-[#ced0d4] hover:bg-[#f1f4f7]'
          }`}
        >
          Verifier Storage Audit ({auditRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer border flex items-center space-x-1.5 ${
            activeTab === 'benchmarks'
              ? 'bg-[#0a1317] text-white border-[#0a1317]'
              : 'bg-white text-[#1c1e21] border-[#ced0d4] hover:bg-[#f1f4f7]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-[#0064e0]" />
          <span>ZK & Proof Benchmarks</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer border flex items-center space-x-1.5 ${
            activeTab === 'security'
              ? 'bg-[#0a1317] text-white border-[#0a1317]'
              : 'bg-white text-[#1c1e21] border-[#ced0d4] hover:bg-[#f1f4f7]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#e41e3f]" />
          <span>Security Threat Simulator</span>
        </button>
      </div>

      {activeTab === 'create' && <RequestBuilder onCreateRequest={onCreateRequest} />}

      {activeTab === 'active' && (
        <Card variant="default" className="space-y-4">
          <h3 className="text-base font-bold text-white">Active Verification Requests</h3>
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{req.purpose}</h4>
                  <p className="text-slate-400 font-mono text-[11px] mt-0.5">{req.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={req.status === 'VERIFIED' ? 'emerald' : 'amber'}>
                    {req.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'audit' && <MinimalAuditStorageView records={auditRecords} />}

      {activeTab === 'benchmarks' && <ZkBenchmarkPanel />}

      {activeTab === 'security' && <SecurityAttackSimulator />}
    </div>
  );
};
