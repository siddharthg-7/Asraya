import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { TrustBadge } from '../../ui/TrustBadge';
import { VerificationRequest, BoundedPredicate } from '../../../types/protocol';
import { Building2, ShieldCheck, Check, EyeOff, Lock, XCircle, ArrowLeft, Clock } from 'lucide-react';

export interface RequestDetailViewProps {
  request: VerificationRequest;
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const RequestDetailView: React.FC<RequestDetailViewProps> = ({
  request,
  onApprove,
  onDecline,
  onBack,
  isLoading = false,
}) => {
  const isExpired = new Date(request.expiryTimestamp).getTime() < Date.now();

  return (
    <div className="max-w-3xl mx-auto my-8 animate-fade-in p-4 space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Wallet Requests</span>
      </button>

      {/* Header Profile */}
      <Card variant="accent" className="border-indigo-500/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{request.verifierName}</h2>
                <Badge variant="indigo">{request.verifierCategory}</Badge>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{request.verifierDid}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TrustBadge type="zero-pii" />
            {isExpired && <Badge variant="rose">EXPIRED</Badge>}
          </div>
        </div>
      </Card>

      {/* Purpose & Context */}
      <Card variant="default" className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Purpose</h3>
        <p className="text-sm font-semibold text-white bg-slate-950 p-3 rounded-xl border border-slate-800">
          {request.purpose}
        </p>
        <div className="flex justify-between text-xs text-slate-400 pt-1">
          <span>Purpose Code: <code className="text-indigo-300 font-mono">{request.purposeCode}</code></span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Expires: {new Date(request.expiryTimestamp).toLocaleString()}</span>
          </span>
        </div>
      </Card>

      {/* Predicates requested */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>They Need To Verify (3 Bounded Questions)</span>
          </h3>
          <span className="text-xs text-emerald-400 font-mono">0 RAW PII TRANSFERRED</span>
        </div>

        <div className="space-y-3">
          {request.predicates.map((pred: BoundedPredicate) => (
            <div
              key={pred.id}
              className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-bold text-slate-100">{pred.label}</span>
                  <span className="px-2 py-0.5 text-[11px] font-mono bg-indigo-950 text-indigo-300 rounded border border-indigo-500/30">
                    {pred.operator} {String(pred.targetValue)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 pl-6">{pred.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* EXPLICIT PRIVACY BOUNDARY COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
          <div className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>WHAT WILL BE DISCLOSED</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            <li>Boolean proof results for requested predicates</li>
            <li>Cryptographic receipt hash for audit trail</li>
            <li>Zero-knowledge mathematical signature</li>
          </ul>
        </div>

        <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2 text-xs">
          <div className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <EyeOff className="w-4 h-4 text-rose-400" />
            <span>WHAT WILL NOT BE SHARED</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            <li>Your raw ID card / Aadhaar number</li>
            <li>Your exact annual income figure</li>
            <li>Your home address line or DOB</li>
          </ul>
        </div>
      </div>

      {/* Explicit Privacy Banner */}
      <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-xl text-center space-y-1">
        <p className="text-sm font-bold text-indigo-300">
          "Your underlying documents and raw personal data are NOT being shared."
        </p>
        <p className="text-xs text-slate-400">
          Evaluated locally inside your non-custodial wallet enclave under Āśraya Protocol invariants.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          onClick={() => onDecline(request.id)}
          disabled={isLoading || isExpired}
          leftIcon={<XCircle className="w-4 h-4 text-rose-400" />}
        >
          Decline Request
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => onApprove(request.id)}
          isLoading={isLoading}
          disabled={isExpired}
          leftIcon={<ShieldCheck className="w-5 h-5" />}
        >
          Approve & Issue ZK Proof
        </Button>
      </div>
    </div>
  );
};
