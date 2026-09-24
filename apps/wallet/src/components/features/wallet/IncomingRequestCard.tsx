import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { StatusBadge } from '../../ui/StatusBadge';
import { TrustBadge } from '../../ui/TrustBadge';
import { VerificationRequest, BoundedPredicate } from '../../../types/protocol';
import { Building2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export interface IncomingRequestCardProps {
  request: VerificationRequest;
  onReview: (request: VerificationRequest) => void;
}

export const IncomingRequestCard: React.FC<IncomingRequestCardProps> = ({ request, onReview }) => {
  return (
    <Card variant="accent" className="border-indigo-500/30 hover:border-indigo-500/50 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <TrustBadge type="zero-pii" size="sm" />
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {request.verifierCategory}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>{request.verifierName}</span>
          </h3>

          <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="font-semibold text-indigo-300">Purpose: </span>
            {request.purpose}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {request.predicates.map((p: BoundedPredicate) => (
              <span
                key={p.id}
                className="text-[11px] font-mono bg-indigo-950/80 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 flex items-center gap-1"
              >
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>{p.label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <Button
            variant="primary"
            size="md"
            onClick={() => onReview(request)}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Review & Consent
          </Button>
          <span className="text-[10px] text-slate-400 text-center font-mono">
            Expires in {Math.round((new Date(request.expiryTimestamp).getTime() - Date.now()) / 3600000)}h
          </span>
        </div>
      </div>
    </Card>
  );
};
