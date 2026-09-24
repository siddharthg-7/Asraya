import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { TrustBadge } from '../../ui/TrustBadge';
import { VerificationResult, AuditReceipt } from '../../../types/protocol';
import { downloadAuditReceipt } from '../../../utils/receiptExporter';
import { ShieldCheck, CheckCircle2, EyeOff, FileText, ArrowLeft, Lock } from 'lucide-react';

export interface VerificationResultViewProps {
  result: VerificationResult;
  receipt?: AuditReceipt | null;
  onBackToWallet: () => void;
}

export const VerificationResultView: React.FC<VerificationResultViewProps> = ({
  result,
  receipt,
  onBackToWallet,
}) => {
  return (
    <div className="max-w-2xl mx-auto my-8 animate-fade-in p-4 space-y-6">
      {/* Result Status Banner */}
      <Card
        variant="bordered"
        className="border-emerald-500/40 bg-emerald-950/20 p-8 text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl">
          <CheckCircle2 className="w-9 h-9 text-emerald-400" />
        </div>

        <div className="flex justify-center gap-2">
          <TrustBadge type="zero-pii" />
          <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Proof Verified
          </Badge>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-white">VERIFICATION COMPLETE</h2>
          <p className="text-sm font-semibold text-emerald-300 mt-1">
            Eligibility Confirmed for {result.verifierName}
          </p>
        </div>

        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Zero-knowledge predicate evaluation completed successfully. Only boolean mathematical
          answers were shared with the verifier.
        </p>
      </Card>

      {/* Disclosed Predicates Grid */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Disclosed Bounded Answers (Predicates Only)</span>
          </h4>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <EyeOff className="w-3.5 h-3.5" /> 0 Raw PII Exposed
          </span>
        </div>

        <div className="space-y-2">
          {result.predicateResults.map(
            (pr: { predicateId: string; label: string; satisfied: boolean }) => (
              <div
                key={pr.predicateId}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">{pr.label}</span>
                </div>
                <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  VERIFIED (TRUE)
                </span>
              </div>
            ),
          )}
        </div>
      </Card>

      {/* Audit Receipt Summary */}
      {receipt && (
        <Card variant="subtle" className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Cryptographic Consent Receipt</span>
            </h4>
            <button
              onClick={() => downloadAuditReceipt(receipt)}
              className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
            >
              <span>Export JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">Receipt ID</span>
              <span className="text-slate-200">{receipt.receiptId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Verifier DID</span>
              <span className="text-slate-300 truncate block">{receipt.verifierDid}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Timestamp</span>
              <span className="text-slate-300">
                {new Date(receipt.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between items-center">
            <span className="truncate max-w-xs">Hash: {receipt.receiptHash}</span>
            <span className="text-emerald-400 font-bold text-[10px]">DEMO RECEIPT</span>
          </div>
        </Card>
      )}

      {/* Action Navigation */}
      <div className="flex justify-center pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={onBackToWallet}
          leftIcon={<ArrowLeft className="w-5 h-5" />}
        >
          Return to Citizen Wallet
        </Button>
      </div>
    </div>
  );
};
