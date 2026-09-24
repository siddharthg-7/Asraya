import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { TrustBadge } from '../../ui/TrustBadge';
import { AuditReceipt } from '../../../types/protocol';
import { downloadAuditReceipt } from '../../../utils/receiptExporter';
import { FileCode, ShieldCheck, CheckCircle2, Download } from 'lucide-react';

export interface AuditReceiptsListProps {
  receipts: AuditReceipt[];
}

export const AuditReceiptsList: React.FC<AuditReceiptsListProps> = ({ receipts }) => {
  return (
    <div className="space-y-4">
      {receipts.length === 0 ? (
        <Card variant="subtle" className="text-center py-10 text-slate-400">
          <FileCode className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium">No Consent Receipts Issued Yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Receipts will automatically record here upon proof generation.
          </p>
        </Card>
      ) : (
        receipts.map((rcpt) => (
          <Card key={rcpt.receiptId} variant="default" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">{rcpt.verifierName}</h4>
                  <span className="text-[11px] font-mono text-slate-400">{rcpt.verifierDid}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadAuditReceipt(rcpt)}
                  className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
                <TrustBadge type="zero-pii" size="sm" />
                <Badge variant="emerald" icon={<CheckCircle2 className="w-3 h-3" />}>
                  Receipt Verified
                </Badge>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              <span className="font-semibold text-slate-400">Purpose: </span>
              {rcpt.purpose}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">
                  Predicates Disclosed
                </span>
                <span className="text-indigo-300 font-bold">
                  {rcpt.disclosedPredicatesCount} Bounded Answers
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">
                  Raw Attributes Exposed
                </span>
                <span className="text-emerald-400 font-bold">0 Attributes (STRICT INVARIANT)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Timestamp</span>
                <span className="text-slate-300">{new Date(rcpt.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="truncate max-w-xs sm:max-w-md">
                Receipt Hash: {rcpt.receiptHash}
              </span>
              <span className="text-indigo-400 text-[10px] font-bold uppercase">
                CRYPTOGRAPHIC RECEIPT
              </span>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};
