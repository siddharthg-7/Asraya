import React, { useEffect, useState } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { ProofStateMachineState } from '../../../types/protocol';
import { proofService } from '../../../services/api/proofService';
import { Cpu, CheckCircle2, Loader2, Lock, AlertCircle } from 'lucide-react';

export interface ProofGenerationViewProps {
  requestId: string;
  onComplete: () => void;
  onError?: () => void;
}

export const ProofGenerationView: React.FC<ProofGenerationViewProps> = ({
  requestId,
  onComplete,
  onError,
}) => {
  const [currentState, setCurrentState] = useState<ProofStateMachineState>('REQUEST_RECEIVED');

  useEffect(() => {
    let isMounted = true;

    const runStateMachine = async () => {
      try {
        await proofService.generateProofWithState(requestId, (state) => {
          if (isMounted) {
            setCurrentState(state);
          }
        });
        if (isMounted) {
          setTimeout(() => onComplete(), 500);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setCurrentState('FAILED');
          onError?.();
        }
      }
    };

    runStateMachine();

    return () => {
      isMounted = false;
    };
  }, [requestId, onComplete, onError]);

  const stateSteps: Array<{ key: ProofStateMachineState; label: string }> = [
    { key: 'REQUEST_RECEIVED', label: '1. Request Received & DID Signature Verified' },
    { key: 'CONSENT_GRANTED', label: '2. Holder Consent Confirmed in Enclave' },
    { key: 'PREPARING', label: '3. Matching Credentials Located' },
    { key: 'GENERATING', label: '4. Generating BBS+ Selective Disclosure Proof' },
    { key: 'READY', label: '5. Non-Repudiable Receipt Signed & Dispatched' },
  ];

  const getStepIndex = (state: ProofStateMachineState): number => {
    switch (state) {
      case 'REQUEST_RECEIVED': return 0;
      case 'CONSENT_PENDING': return 0;
      case 'CONSENT_GRANTED': return 1;
      case 'PREPARING': return 2;
      case 'GENERATING': return 3;
      case 'READY': return 4;
      case 'FAILED': return -1;
    }
  };

  const currentIndex = getStepIndex(currentState);

  return (
    <div className="max-w-md mx-auto my-12 animate-fade-in p-4">
      <Card variant="accent" className="text-center p-8 border-indigo-500/40 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto shadow-xl shadow-indigo-950/50">
          <Cpu className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-xs font-mono mb-3">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>DEMO PROOF GENERATION STATE MACHINE</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-1">Generating Privacy Proof</h3>
          <p className="text-xs text-slate-400 font-mono">
            Current State: <strong className="text-indigo-300">{currentState}</strong>
          </p>
        </div>

        {/* Step-by-step state progress list */}
        <div className="space-y-3 text-left bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          {stateSteps.map((s, idx) => {
            const isCompleted = currentIndex > idx;
            const isCurrent = currentIndex === idx;

            return (
              <div
                key={s.key}
                className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                  isCompleted
                    ? 'text-emerald-300 font-medium'
                    : isCurrent
                    ? 'text-indigo-300 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                )}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {currentState === 'FAILED' && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs text-left">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Proof generation was interrupted. Please retry.</span>
          </div>
        )}

        <Badge variant="neutral" className="text-[11px] font-mono">
          Notice: Simulated proof calculation for demonstration
        </Badge>
      </Card>
    </div>
  );
};
