import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { TrustBadge } from '../../ui/TrustBadge';
import { BoundedPredicate } from '../../../types/protocol';
import { Building2, Send, Lock, ShieldCheck } from 'lucide-react';

export interface RequestPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSend: () => void;
  verifierName: string;
  purpose: string;
  purposeCode: string;
  predicates: Omit<BoundedPredicate, 'id'>[];
  isLoading?: boolean;
}

export const RequestPreviewModal: React.FC<RequestPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirmSend,
  verifierName,
  purpose,
  purposeCode,
  predicates,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <span>Verifier Request Preview</span>
        </div>
      }
      subtitle="Review the bounded question contract before signing and dispatching."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Requester Profile */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white text-sm">{verifierName}</span>
            <TrustBadge type="zero-pii" size="sm" />
          </div>
          <p className="text-slate-400">
            Purpose: <span className="text-slate-200">{purpose}</span>
          </p>
          <p className="text-slate-400 font-mono">
            Code: <span className="text-indigo-300">{purposeCode}</span>
          </p>
        </div>

        {/* Predicates requested */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Requested Bounded Conditions ({predicates.length})</span>
          </h4>

          <div className="space-y-2">
            {predicates.map((p, i) => (
              <div
                key={i}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{p.label}</span>
                  <span className="font-mono text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    {p.field} {p.operator} {String(p.targetValue)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Educational Guarantee Banner */}
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs space-y-1">
          <div className="font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Educational Guarantee</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            You are asking the citizen to prove these bounded conditions locally. You will receive
            ONLY boolean proof answers, zero underlying documents.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Edit Request
          </Button>
          <Button
            variant="primary"
            onClick={onConfirmSend}
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send Verification Request
          </Button>
        </div>
      </div>
    </Modal>
  );
};
