import React from 'react';
import { Card } from '../../ui/Card';
import { TrustBadge } from '../../ui/TrustBadge';
import { Check, X, Database } from 'lucide-react';

export const MinimalStoragePanel: React.FC = () => {
  return (
    <Card variant="bordered" className="border-indigo-500/30 bg-slate-950/90 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Verifier Database Storage Model</h3>
        </div>
        <TrustBadge type="zero-pii" size="sm" />
      </div>

      <p className="text-xs text-slate-300">
        Āśraya Minimal Storage Model Invariant: Verifiers store strictly audit metadata. ZERO raw citizen attributes are stored.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* ALLOWED STORAGE */}
        <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
          <div className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>ALLOWED VERIFIER STORAGE (AUDIT metadata)</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 list-none">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Verification status verdict (<code className="text-emerald-300">VALID_PROOF</code>)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>ISO Timestamp & Nonce</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Bounded purpose description</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Session / Reference Identifier</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Signed cryptographic receipt hash</span>
            </li>
          </ul>
        </div>

        {/* FORBIDDEN / NOT STORED */}
        <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
          <div className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
            <X className="w-4 h-4 text-rose-400" />
            <span>NEVER STORED BY VERIFIER (ZERO RAW PII)</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 list-none">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>✕ Raw citizen income figure</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>✕ Full residential home address</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>✕ National Identity Card / Aadhaar #</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>✕ Raw credential PDF scans</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>✕ Decrypted credential attributes</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
