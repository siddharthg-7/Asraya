import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { TrustBadge } from '../../ui/TrustBadge';
import { VerifierAuditRecord, AuditReceipt } from '../../../types/protocol';
import { Database, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AuditReceiptInspectorModal } from './AuditReceiptInspectorModal';

export interface MinimalAuditStorageViewProps {
  records: VerifierAuditRecord[];
}

export const MinimalAuditStorageView: React.FC<MinimalAuditStorageViewProps> = ({ records }) => {
  const [selectedInspectReceipt, setSelectedInspectReceipt] = useState<AuditReceipt | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  const handleInspectRecord = (rec: VerifierAuditRecord) => {
    const mockReceipt: AuditReceipt = {
      receiptId: `rcpt-${rec.sessionId.replace(/^sess-/, '')}`,
      requestId: rec.requestId,
      citizenWalletDid: 'did:asraya:citizen:wallet-7a91f4b2',
      verifierDid: 'did:asraya:verifier:municipal-ev-dept',
      verifierName: 'Municipal Office',
      timestamp: rec.timestamp,
      purpose: rec.purpose,
      disclosedPredicatesCount: 3,
      rawAttributesExposed: 0,
      receiptHash: rec.receiptHash,
      signature: `sig:bbs:${rec.receiptHash.substring(0, 32)}`,
    };

    setSelectedInspectReceipt(mockReceipt);
    setIsInspectorOpen(true);
  };

  return (
    <>
      <Card variant="bordered" className="border-indigo-500/30 bg-slate-950/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Verifier Minimal Audit Log Storage</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Āśraya Minimal Storage Model: Strictly stores verdict, session ID, timestamp, and
              receipt hash. ZERO raw PII stored.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedInspectReceipt(null);
                setIsInspectorOpen(true);
              }}
              className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Inspector Modal</span>
            </button>
            <TrustBadge type="zero-pii" />
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <Database className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <span>No audit records stored yet. Run a verification flow to populate.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Session ID</th>
                  <th className="py-2.5 px-3">Purpose</th>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-3">Raw PII Saved</th>
                  <th className="py-2.5 px-3">Receipt Hash</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((rec) => (
                  <tr key={rec.sessionId} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3 text-indigo-300 font-bold">{rec.sessionId}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans max-w-xs truncate">
                      {rec.purpose}
                    </td>
                    <td className="py-3 px-3">
                      {rec.verdict === 'VALID_PROOF' ? (
                        <Badge variant="emerald" icon={<CheckCircle2 className="w-3 h-3" />}>
                          VALID PROOF
                        </Badge>
                      ) : rec.verdict === 'REJECTED_BY_CITIZEN' ? (
                        <Badge variant="rose">REJECTED</Badge>
                      ) : (
                        <Badge variant="amber">INVALID</Badge>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                        0 ATTRIBUTES (0 BYTES)
                      </span>
                    </td>
                    <td
                      className="py-3 px-3 text-slate-400 truncate max-w-[120px]"
                      title={rec.receiptHash}
                    >
                      {rec.receiptHash}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleInspectRecord(rec)}
                        className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[11px] font-sans font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AuditReceiptInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        initialReceipt={selectedInspectReceipt}
      />
    </>
  );
};
