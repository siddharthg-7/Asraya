import React, { useState } from 'react';
import { ShieldCheck, Database, FileText, CheckCircle2, XCircle } from 'lucide-react';

export const PrivacyComparisonVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'table' | 'payload'>('table');

  return (
    <section className="py-16 bg-white border-y border-[#dee3e9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f1f4f7] border border-[#dee3e9] text-[#1c1e21] text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#0a1317]" />
            <span>Architecture Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium text-[#0a1317] tracking-tight">
            Why ĀŚRAYA is Different
          </h2>
          <p className="text-[#444950] text-sm sm:text-base">
            Compare the information exchanged during a conventional verification flow with a
            minimal-proof flow.
          </p>
        </div>

        {/* Meta Pill Tab Selection */}
        <div className="flex justify-center">
          <div className="bg-[#f1f4f7] p-1.5 rounded-full border border-[#dee3e9] flex gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-6 py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-[#0a1317] text-white font-bold shadow-none'
                  : 'text-[#444950] hover:text-[#0a1317]'
              }`}
            >
              Side-by-Side Property Comparison
            </button>
            <button
              onClick={() => setActiveTab('payload')}
              className={`px-6 py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'payload'
                  ? 'bg-[#0a1317] text-white font-bold shadow-none'
                  : 'text-[#444950] hover:text-[#0a1317]'
              }`}
            >
              Verifier Database Payload View
            </button>
          </div>
        </div>

        {activeTab === 'table' ? (
          <div className="bg-white border border-[#dee3e9] rounded-3xl overflow-hidden shadow-none">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#f1f4f7] text-[#0a1317] border-b border-[#dee3e9] uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-6 sm:px-8">Verification Property</th>
                  <th className="py-4 px-6 sm:px-8 text-[#e41e3f]">Traditional Ingestion</th>
                  <th className="py-4 px-6 sm:px-8 text-[#137333]">Āśraya Minimal Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee3e9] text-[#1c1e21]">
                <tr>
                  <td className="py-5 px-6 sm:px-8 font-bold text-[#0a1317]">Citizen Action</td>
                  <td className="py-5 px-6 sm:px-8 text-[#e41e3f] flex items-start space-x-2">
                    <XCircle className="w-4 h-4 text-[#e41e3f] shrink-0 mt-0.5" />
                    <span>Uploads full PDF scans / ID cards</span>
                  </td>
                  <td className="py-5 px-6 sm:px-8 text-[#137333] font-bold flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#137333] shrink-0 mt-0.5" />
                    <span>No document uploads (Local enclave proof)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-5 px-6 sm:px-8 font-bold text-[#0a1317]">Verifier Receives</td>
                  <td className="py-5 px-6 sm:px-8 text-[#e41e3f]">
                    Full DOB, legal name, residential address, ID numbers
                  </td>
                  <td className="py-5 px-6 sm:px-8 text-[#137333] font-bold">
                    Requested claim only (1-bit boolean answer: TRUE/FALSE)
                  </td>
                </tr>
                <tr>
                  <td className="py-5 px-6 sm:px-8 font-bold text-[#0a1317]">Data Retained</td>
                  <td className="py-5 px-6 sm:px-8 text-[#e41e3f]">
                    Potentially large raw PII stored in databases indefinitely
                  </td>
                  <td className="py-5 px-6 sm:px-8 text-[#137333] font-bold">
                    Minimal audit receipt (Session ID, timestamp, receipt hash, 0 PII)
                  </td>
                </tr>
                <tr>
                  <td className="py-5 px-6 sm:px-8 font-bold text-[#0a1317]">
                    Citizen Consent Model
                  </td>
                  <td className="py-5 px-6 sm:px-8 text-[#e41e3f]">
                    Blanket document upload consent
                  </td>
                  <td className="py-5 px-6 sm:px-8 text-[#137333] font-bold">
                    Purpose-bounded predicate consent (Non-custodial)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#dee3e9] rounded-3xl p-6 sm:p-8">
              <h4 className="text-xs font-bold text-[#e41e3f] uppercase tracking-wider mb-3 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#e41e3f]" />
                <span>Traditional Verifier Database Record (Harvested)</span>
              </h4>
              <pre className="p-5 bg-[#0a1317] text-[#fce8e6] rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-[#0a1317]">
                {`{
  "record_id": "rec_9918231",
  "citizen_full_name": "Aditya Sharma",
  "citizen_dob": "1996-08-14",
  "aadhaar_number": "XXXX-XXXX-9918",
  "residential_address": "42 MG Road, Koramangala",
  "exact_annual_income": 240000,
  "rto_permit_number": "KA-01-COMM-2024-9182",
  "raw_document_scans": ["s3://storage/doc1.pdf"]
}`}
              </pre>
            </div>

            <div className="bg-white border border-[#dee3e9] rounded-3xl p-6 sm:p-8">
              <h4 className="text-xs font-bold text-[#137333] uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#137333]" />
                <span>Āśraya Minimal Audit Record (Zero PII)</span>
              </h4>
              <pre className="p-5 bg-[#0a1317] text-[#ceead6] rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-[#0a1317]">
                {`{
  "session_id": "sess_8f92a401",
  "verifier_did": "did:asraya:verifier:municipal-ev-dept",
  "verdict": "VALID_PROOF",
  "proof_tier": "TIER_A_BBS_PLUS",
  "disclosed_predicates": [
    { "permit_valid": true },
    { "income_below_3L": true },
    { "state_is_KA": true }
  ],
  "raw_pii_attributes_stored": 0,
  "receipt_hash": "0xa49f7e82b1c3d5e6f7a8b9c0d1e2..."
}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
