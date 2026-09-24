import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { TrustBadge } from '../../ui/TrustBadge';
import { WireFlowInspector } from './WireFlowInspector';
import { MinimalStoragePanel } from '../verifier/MinimalStoragePanel';
import { ZkBenchmarkPanel } from './ZkBenchmarkPanel';
import { SecurityAttackSimulator } from './SecurityAttackSimulator';
import { VerificationRequest, VerificationResult, AuditReceipt, VerifierAuditRecord } from '../../../types/protocol';
import { MOCK_PENDING_REQUESTS } from '../../../data/mockData';
import { pramanaService } from '../../../services/mock/mockPramanaService';
import { Building2, User, ShieldCheck, CheckCircle2, RotateCcw, ArrowRight, Sparkles, Cpu, Send, Check } from 'lucide-react';

export interface TwoPanelDemoViewProps {
  onResetAll?: () => void;
}

export const TwoPanelDemoView: React.FC<TwoPanelDemoViewProps> = () => {
  const [wireStage, setWireStage] = useState<'REQUEST' | 'CONTRACT' | 'WALLET' | 'CONSENT' | 'PROOF' | 'VERIFIER' | 'RECEIPT'>('REQUEST');
  const [step, setStep] = useState<number>(1);

  const [activeRequest] = useState<VerificationRequest>(MOCK_PENDING_REQUESTS[0]!);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [demoPayload, setDemoPayload] = useState<{
    result: VerificationResult;
    receipt: AuditReceipt;
    verifierAudit: VerifierAuditRecord;
  } | null>(null);

  const handleCreateAndSendRequest = () => {
    setWireStage('CONTRACT');
    setTimeout(() => {
      setWireStage('WALLET');
      setStep(2); // Citizen receives request
    }, 400);
  };

  const handleGrantConsent = async () => {
    setIsProcessing(true);
    setWireStage('CONSENT');
    setStep(3); // Consent granted

    setTimeout(() => {
      setWireStage('PROOF');
    }, 400);

    try {
      await pramanaService.approveRequest(activeRequest.id);
      const res = await pramanaService.generateProof(activeRequest.id);
      setDemoPayload(res);

      setWireStage('VERIFIER');
      setTimeout(() => {
        setWireStage('RECEIPT');
        setStep(4); // End-to-End verified
      }, 500);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setWireStage('REQUEST');
    setDemoPayload(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <Card variant="accent" className="border-indigo-500/40 bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Live Side-by-Side Judge Demo</h2>
                <Badge variant="emerald" icon={<Sparkles className="w-3 h-3" />}>
                  Synchronized Dual Console
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Simulates real-time protocol flow between Verifier Portal (Left) and Citizen Wallet (Right).
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
            Restart Demo Script
          </Button>
        </div>
      </Card>

      {/* Protocol Wire Inspector */}
      <WireFlowInspector currentStage={wireStage} />

      {/* TWO PANEL SPLIT LAYOUT (Desktop: 2 Columns, Mobile: Sequential Stack) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: VERIFIER CONSOLE */}
        <Card variant="bordered" className="border-indigo-500/40 bg-slate-900/90 space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-950 rounded-lg border border-indigo-500/30 text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">VERIFIER CONSOLE</h3>
                <p className="text-[11px] font-mono text-slate-400">did:asraya:verifier:municipal-ev-dept</p>
              </div>
            </div>

            <TrustBadge type="zero-pii" size="sm" />
          </div>

          {/* VERIFIER STAGE 1: DISPATCH REQUEST */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-white">
                  <span>{activeRequest.verifierName}</span>
                  <span className="text-indigo-300 font-mono">{activeRequest.purposeCode}</span>
                </div>
                <p className="text-slate-300">{activeRequest.purpose}</p>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block mb-1">Requested Predicates (Bounded Questions):</span>
                  <ul className="space-y-1 text-indigo-300 font-mono">
                    <li>✓ Valid Commercial EV Permit = TRUE</li>
                    <li>✓ Annual Income &lt;= ₹3,00,000</li>
                    <li>✓ State Jurisdiction == 'Karnataka'</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
                "You are asking the citizen to prove these conditions, NOT to upload raw documents."
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleCreateAndSendRequest}
                leftIcon={<Send className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                1. Dispatch Bounded Request to Wallet
              </Button>
            </div>
          )}

          {/* VERIFIER STAGE 2: AWAITING CONSENT */}
          {(step === 2 || step === 3) && (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <Cpu className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-white">Awaiting Citizen Enclave Consent & Proof</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Request dispatched to citizen wallet. Waiting for local BBS+ ZK proof execution.
              </p>
            </div>
          )}

          {/* VERIFIER STAGE 3: RESULT RECEIVED */}
          {step === 4 && demoPayload && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>VERIFICATION SUCCESSFUL (VALID PROOF)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
                  {demoPayload.result.predicateResults.map((pr: { predicateId: string; label: string; satisfied: boolean }) => (
                    <div key={pr.predicateId} className="p-2 bg-slate-950 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[9px] truncate">{pr.label}</span>
                      <span className="text-emerald-400 font-bold text-xs">PASSED</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimal Storage Educational View */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-indigo-300 font-bold">
                  <span>Verifier DB Audit Record</span>
                  <span className="text-emerald-400">0 RAW ATTRIBUTES STORED</span>
                </div>
                <div className="text-slate-400 truncate">Session: {demoPayload.verifierAudit.sessionId}</div>
                <div className="text-slate-400 truncate">Receipt Hash: {demoPayload.receipt.receiptHash.substring(0, 24)}...</div>
              </div>
            </div>
          )}
        </Card>

        {/* RIGHT PANEL: CITIZEN WALLET */}
        <Card variant="accent" className="border-emerald-500/40 bg-slate-900/90 space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-950 rounded-lg border border-emerald-500/30 text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">CITIZEN IDENTITY WALLET</h3>
                <p className="text-[11px] font-mono text-slate-400">did:asraya:citizen:demo-8f92a4</p>
              </div>
            </div>

            <TrustBadge type="local-enclave" size="sm" />
          </div>

          {/* CITIZEN STAGE 1: IDLE */}
          {step === 1 && (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">Wallet Enclave Idle</p>
              <p className="text-slate-500">Click "1. Dispatch Bounded Request" on the left panel to trigger incoming request.</p>
            </div>
          )}

          {/* CITIZEN STAGE 2: INCOMING REQUEST REVIEW & CONSENT */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Incoming Request: {activeRequest.verifierName}</span>
                  <Badge variant="amber">Pending Consent</Badge>
                </div>

                <p className="text-slate-300">{activeRequest.purpose}</p>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-300 block mb-1">Bounded Conditions Requested:</span>
                  <ul className="space-y-1 text-slate-300">
                    <li className="flex items-center gap-1.5 text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                      <span>Valid Commercial EV Permit</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                      <span>Annual Income &lt;= ₹3,00,000</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                      <span>Residency State == 'Karnataka'</span>
                    </li>
                  </ul>
                </div>

                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300">
                  "Your underlying documents (Aadhaar, Tax Returns) remain encrypted inside local enclave."
                </div>
              </div>

              <Button
                variant="success"
                size="md"
                className="w-full"
                onClick={handleGrantConsent}
                isLoading={isProcessing}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                2. Citizen Grants Consent & Generates ZK Proof
              </Button>
            </div>
          )}

          {/* CITIZEN STAGE 3: PROOF GENERATING */}
          {step === 3 && (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <Cpu className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-white">Generating Local BBS+ Proof</h4>
              <p className="text-xs text-slate-400">
                Evaluating claims locally inside citizen hardware enclave...
              </p>
            </div>
          )}

          {/* CITIZEN STAGE 4: RECEIPT GENERATED */}
          {step === 4 && demoPayload && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Proof Generated & Verified</span>
                  </span>
                  <Badge variant="emerald">RECEIPT ISSUED</Badge>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                  <div>Receipt ID: {demoPayload.receipt.receiptId}</div>
                  <div>Disclosed Predicates: 3 Answers</div>
                  <div className="text-emerald-400 font-bold">Raw Attributes Exposed: 0</div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                  Restart Demo Script
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Minimal Storage Educational Banner */}
      <MinimalStoragePanel />

      {/* Phase 4 Advanced Cryptographic & Resilience Benchmarks */}
      <div className="pt-4 space-y-6">
        <ZkBenchmarkPanel />
        <SecurityAttackSimulator />
      </div>
    </div>
  );
};
