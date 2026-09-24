import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { TrustBadge } from '../../ui/TrustBadge';
import { CredentialClaim } from '../../../types/protocol';
import { FileCheck, CheckCircle2, Lock, Eye } from 'lucide-react';

export interface CredentialsListProps {
  credentials: CredentialClaim[];
}

export const CredentialsList: React.FC<CredentialsListProps> = ({ credentials }) => {
  return (
    <div className="space-y-6">
      {/* Enclave Status Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Local Non-Custodial Storage</h4>
            <p className="text-xs text-slate-400">
              Credentials are encrypted with WebCrypto device keys. Raw data NEVER leaves this wallet.
            </p>
          </div>
        </div>
        <TrustBadge type="local-enclave" />
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {credentials.map((cred) => (
          <Card key={cred.id} variant="default" className="relative group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <h4 className="text-base font-bold text-slate-100">{cred.credentialType}</h4>
              </div>
              <Badge variant="emerald" icon={<CheckCircle2 className="w-3 h-3" />}>
                Active Claim
              </Badge>
            </div>

            <p className="text-xs font-semibold text-slate-300 mb-1">{cred.issuerName}</p>
            <p className="text-[11px] font-mono text-slate-400 mb-4">{cred.issuerDid}</p>

            {/* Local Attributes Box */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1.5 text-xs mb-4">
              <div className="text-[10px] font-bold uppercase text-indigo-300 tracking-wider flex items-center gap-1 mb-2">
                <Eye className="w-3 h-3 text-indigo-400" />
                <span>Holder Private Preview (Local Only)</span>
              </div>
              {Object.entries(cred.attributes).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-mono text-slate-100 font-medium">
                    {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : String(val)}
                  </span>
                </div>
              ))}
            </div>

            {/* Credential Metadata */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Issued: {new Date(cred.issuedAt).toLocaleDateString()}</span>
              {cred.isMock && (
                <span className="font-mono text-amber-400 text-[10px]">DEMO TEST VECTOR</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
