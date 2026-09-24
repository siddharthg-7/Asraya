import React from 'react';
import { Card } from '../../ui/Card';
import { Building2, User, Lock, Cpu, CheckCircle2, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

export interface WireFlowInspectorProps {
  currentStage: 'REQUEST' | 'CONTRACT' | 'WALLET' | 'CONSENT' | 'PROOF' | 'VERIFIER' | 'RECEIPT';
}

export const WireFlowInspector: React.FC<WireFlowInspectorProps> = ({ currentStage }) => {
  const steps: Array<{
    id: 'REQUEST' | 'CONTRACT' | 'WALLET' | 'CONSENT' | 'PROOF' | 'VERIFIER' | 'RECEIPT';
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }> = [
    { id: 'REQUEST', label: '1. Verifier', sublabel: 'Dispatches Question', icon: <Building2 className="w-4 h-4" /> },
    { id: 'CONTRACT', label: '2. Contract', sublabel: 'Signed Nonce', icon: <Lock className="w-4 h-4" /> },
    { id: 'WALLET', label: '3. Citizen Wallet', sublabel: 'Enclave Received', icon: <User className="w-4 h-4" /> },
    { id: 'CONSENT', label: '4. Consent', sublabel: 'Explicit Approval', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'PROOF', label: '5. ZK Proof', sublabel: 'BBS+ Computation', icon: <Cpu className="w-4 h-4" /> },
    { id: 'VERIFIER', label: '6. Verifier', sublabel: 'Zero-PII Verdict', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'RECEIPT', label: '7. Receipt', sublabel: 'Audit Logged', icon: <FileText className="w-4 h-4" /> },
  ];

  const getStageIndex = (stage: typeof currentStage) => {
    return steps.findIndex((s) => s.id === stage);
  };

  const activeIdx = getStageIndex(currentStage);

  return (
    <Card variant="accent" className="border-indigo-500/30 bg-slate-950/80 p-4">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Protocol Wire & Flow State Inspector</span>
        </h4>
        <span className="text-[10px] font-mono text-slate-400">
          Synthetic Protocol State: <strong className="text-emerald-400">{currentStage}</strong>
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const isDone = activeIdx > idx;
          const isCurrent = activeIdx === idx;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`p-2.5 rounded-xl border flex flex-col items-center min-w-[100px] text-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-500/60 shadow-lg shadow-indigo-950/50 scale-105'
                    : isDone
                    ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-950 text-slate-600 border-slate-800'
                }`}
              >
                <div className="mb-1">{step.icon}</div>
                <span className="text-[11px] font-bold leading-tight">{step.label}</span>
                <span className="text-[9px] font-mono opacity-80 mt-0.5">{step.sublabel}</span>
              </div>

              {idx < steps.length - 1 && (
                <ArrowRight
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    isDone ? 'text-emerald-400' : isCurrent ? 'text-indigo-400 animate-pulse' : 'text-slate-700'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Card>
  );
};
