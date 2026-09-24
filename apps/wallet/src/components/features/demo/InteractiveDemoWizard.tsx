import React, { useState } from 'react';
import { TwoPanelDemoView } from './TwoPanelDemoView';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { TrustBadge } from '../../ui/TrustBadge';
import {
  VerificationRequest,
  VerificationResult,
  AuditReceipt,
  VerifierAuditRecord,
} from '../../../types/protocol';
import { MOCK_PENDING_REQUESTS } from '../../../data/mockData';
import { pramanaService } from '../../../services/mock/mockPramanaService';
import {
  ShieldCheck,
  Building2,
  User,
  Cpu,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Database,
  Sparkles,
  LayoutGrid,
  PlayCircle,
} from 'lucide-react';

export const InteractiveDemoWizard: React.FC = () => {
  const [demoMode, setDemoMode] = useState<'split' | 'wizard'>('split');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeRequest] = useState<VerificationRequest>(MOCK_PENDING_REQUESTS[0]!);

  const [demoResult, setDemoResult] = useState<{
    result: VerificationResult;
    receipt: AuditReceipt;
    verifierAudit: VerifierAuditRecord;
  } | null>(null);

  const handleStartDemo = () => {
    setCurrentStep(2);
  };

  const handleGrantConsent = async () => {
    setCurrentStep(3); // Proof Generation State

    try {
      await pramanaService.approveRequest(activeRequest.id);
      const res = await pramanaService.generateProof(activeRequest.id);
      setDemoResult(res);
      setCurrentStep(4); // Verification Result & Storage Audit
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setDemoResult(null);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex justify-between items-center">
        <Badge variant="cyan" icon={<Sparkles className="w-3 h-3" />}>
          Interactive Demo Inspector
        </Badge>
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1 text-xs">
          <button
            onClick={() => setDemoMode('split')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              demoMode === 'split'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dual Console View</span>
          </button>
          <button
            onClick={() => setDemoMode('wizard')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              demoMode === 'wizard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Sequential Wizard</span>
          </button>
        </div>
      </div>

      {demoMode === 'split' ? (
        <TwoPanelDemoView />
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8 animate-fade-in">
          {/* Judge Demo Banner */}
          <Card variant="accent" className="border-emerald-500/40 bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">
                      Interactive Live Judge Demonstration
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Simulates the entire end-to-end Āśraya lifecycle: Verifier Request → Citizen
                    Consent → ZK Proof → Verifier Receipt.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset Demo Flow
              </Button>
            </div>
          </Card>

          {/* Progress Steps Header */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold font-mono">
            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 1
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50 shadow-md'
                  : currentStep > 1
                    ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span>1. Verifier Asks</span>
            </div>
            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 2
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50 shadow-md'
                  : currentStep > 2
                    ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span>2. Citizen Consents</span>
            </div>
            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 3
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50 shadow-md'
                  : currentStep > 3
                    ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span>3. Wallet Proves</span>
            </div>
            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 4
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-md'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span>4. Zero-PII Verdict</span>
            </div>
          </div>

          {/* STEP 1: VERIFIER DISPATCH */}
          {currentStep === 1 && (
            <Card variant="default" className="space-y-6 p-8">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Building2 className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    STEP 1: Verifier Dispatches Bounded Question
                  </h3>
                  <p className="text-xs text-slate-400">
                    Municipal EV Subsidy Office dispatches a signed predicate request for EV fleet
                    eligibility.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Verifier:</span>
                  <span className="text-white font-semibold">{activeRequest.verifierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Purpose:</span>
                  <span className="text-slate-200">{activeRequest.purpose}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">
                    Requested Predicates (3 Bounded Questions):
                  </span>
                  <ul className="space-y-1 list-disc list-inside text-indigo-300 font-mono">
                    <li>Valid Commercial EV Permit = TRUE</li>
                    <li>Annual Income &lt;= ₹3,00,000</li>
                    <li>Residency State == 'Karnataka'</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartDemo}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Send Request to Citizen Wallet →
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: CITIZEN CONSENT REVIEW */}
          {currentStep === 2 && (
            <Card variant="accent" className="space-y-6 p-8 border-indigo-500/40">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      STEP 2: Citizen Reviews & Grants Consent
                    </h3>
                    <p className="text-xs text-slate-400">
                      Wallet renders the bounded question contract. Citizen sees zero raw document
                      upload.
                    </p>
                  </div>
                </div>
                <TrustBadge type="zero-pii" />
              </div>

              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs space-y-2">
                <div className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Āśraya Privacy Minimization Assurance</span>
                </div>
                <p className="text-slate-300">
                  Your underlying documents stay inside your hardware enclave. Only boolean
                  mathematical answers are generated.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button variant="outline" onClick={handleReset}>
                  Decline
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGrantConsent}
                  leftIcon={<ShieldCheck className="w-5 h-5" />}
                >
                  Approve & Generate ZK Proof
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: PROOF GENERATION */}
          {currentStep === 3 && (
            <Card variant="subtle" className="text-center p-12">
              <Cpu className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Simulating BBS+ ZK Proof Generation
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
                Evaluating predicates locally against certified claims...
              </p>
            </Card>
          )}

          {/* STEP 4: VERIFICATION RESULT & STORAGE AUDIT */}
          {currentStep === 4 && demoResult && (
            <div className="space-y-6">
              <Card
                variant="bordered"
                className="border-emerald-500/40 bg-emerald-950/20 p-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">VERIFICATION SUCCESSFUL</h3>
                      <p className="text-xs text-emerald-300 font-mono">
                        Verifier received verified answer. Zero raw PII received.
                      </p>
                    </div>
                  </div>
                  <TrustBadge type="zero-pii" />
                </div>

                {/* Predicate Answers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {demoResult.result.predicateResults.map(
                    (pr: { predicateId: string; label: string; satisfied: boolean }) => (
                      <div
                        key={pr.predicateId}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                      >
                        <span className="text-slate-400 block mb-1">{pr.label}</span>
                        <span className="text-emerald-400 font-mono font-bold text-sm">
                          ✓ PASSED (TRUE)
                        </span>
                      </div>
                    ),
                  )}
                </div>

                {/* Verifier Storage View */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    <span>Verifier Database Record (Audited Zero-Storage)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Session ID</span>
                      <span className="text-slate-200">{demoResult.verifierAudit.sessionId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Verdict</span>
                      <span className="text-emerald-400 font-bold">VALID_PROOF</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Raw PII Saved</span>
                      <span className="text-emerald-400 font-bold">0 ATTRIBUTES</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Receipt Signature</span>
                      <span className="text-indigo-300 truncate block">sig:bbs:0x9f8e7d...</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">
                    Receipt Hash: {demoResult.receipt.receiptHash.substring(0, 32)}...
                  </span>
                  <Button
                    variant="primary"
                    onClick={handleReset}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Run Another Demo Cycle
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
