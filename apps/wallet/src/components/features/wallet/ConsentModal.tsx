import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { TrustBadge } from '../../ui/TrustBadge';
import { VerificationRequest, BoundedPredicate } from '../../../types/protocol';
import { ShieldCheck, Building2, Check, Lock, Cpu, EyeOff } from 'lucide-react';

export interface ConsentModalProps {
  request: VerificationRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  isLoading?: boolean;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onDecline,
  isLoading = false,
}) => {
  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>Verification Request Consent</span>
        </div>
      }
      subtitle="Review the bounded question and approve zero-knowledge proof generation."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Requester Profile Banner */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-4">
          <div className="p-3 bg-indigo-950/80 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">{request.verifierName}</h4>
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
                {request.verifierCategory}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{request.verifierDid}</p>
            <p className="text-xs text-slate-300 mt-2 bg-slate-900 p-2 rounded border border-slate-800">
              <span className="font-semibold text-indigo-300">Purpose: </span>
              {request.purpose}
            </p>
          </div>
        </div>

        {/* Bounded Questions / Predicates Box */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Requested Predicates (Bounded Questions)</span>
            </h4>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> Zero Raw Data Exposed
            </span>
          </div>

          <div className="space-y-2">
            {request.predicates.map((pred: BoundedPredicate) => (
              <div
                key={pred.id}
                className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">{pred.label}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-950/80 text-indigo-300 rounded border border-indigo-500/30">
                      {pred.operator} {String(pred.targetValue)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{pred.description}</p>
                </div>
                <div className="p-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Notice Banner */}
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <TrustBadge type="zero-pii" size="sm" />
            <span>ĀŚRAYA Privacy Contract</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{request.privacyNotice}</p>
        </div>

        {/* Technical Detail Collapsible / Info */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Proof Engine:{' '}
              <strong className="text-slate-200">BBS+ Selective Disclosure (Tier A)</strong>
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 font-mono">
            <span>Nonce:</span>
            <span className="text-slate-300">{request.nonce.substring(0, 10)}...</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={() => onDecline(request.id)} disabled={isLoading}>
            Decline Request
          </Button>

          <Button
            variant="primary"
            onClick={() => onApprove(request.id)}
            isLoading={isLoading}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Approve & Generate Proof
          </Button>
        </div>
      </div>
    </Modal>
  );
};
