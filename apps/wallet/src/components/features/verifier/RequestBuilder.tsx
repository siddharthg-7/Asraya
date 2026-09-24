import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { BoundedPredicate } from '../../../types/protocol';
import { Building2, Lock, Send } from 'lucide-react';

export interface RequestBuilderProps {
  onCreateRequest: (params: {
    verifierName: string;
    purpose: string;
    purposeCode: string;
    predicates: Omit<BoundedPredicate, 'id'>[];
  }) => Promise<void>;
}

export const RequestBuilder: React.FC<RequestBuilderProps> = ({ onCreateRequest }) => {
  const [verifierName, setVerifierName] = useState<string>('Municipal EV Subsidy Office');
  const [purpose, setPurpose] = useState<string>(
    'Verification for 2026 Commercial Electric Vehicle Grant',
  );
  const [purposeCode, setPurposeCode] = useState<string>('GOVT_EV_SUBSIDY_2026');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [predicates, setPredicates] = useState<Omit<BoundedPredicate, 'id'>[]>([
    {
      field: 'isValidPermit',
      label: 'Valid Commercial EV Permit',
      operator: 'IS_TRUE',
      targetValue: true,
      description: 'Verify active commercial permit without revealing permit code',
    },
    {
      field: 'annualIncomeInINR',
      label: 'Annual Income Threshold',
      operator: 'LTE',
      targetValue: 300000,
      description: 'Verify income <= ₹3,00,000 without exposing exact salary figure',
    },
    {
      field: 'state',
      label: 'State Residency',
      operator: 'EQ',
      targetValue: 'Karnataka',
      description: 'Verify state residency without exposing home address',
    },
  ]);

  const handleTemplateSelect = (templateType: 'ev' | 'senior') => {
    if (templateType === 'ev') {
      setVerifierName('Municipal EV Subsidy Office');
      setPurpose('Verification for 2026 Commercial Electric Vehicle Grant');
      setPurposeCode('GOVT_EV_SUBSIDY_2026');
      setPredicates([
        {
          field: 'isValidPermit',
          label: 'Valid Commercial EV Permit',
          operator: 'IS_TRUE',
          targetValue: true,
          description: 'Verify active commercial permit without revealing permit code',
        },
        {
          field: 'annualIncomeInINR',
          label: 'Annual Income Threshold',
          operator: 'LTE',
          targetValue: 300000,
          description: 'Verify income <= ₹3,00,000 without exposing exact salary figure',
        },
        {
          field: 'state',
          label: 'State Residency',
          operator: 'EQ',
          targetValue: 'Karnataka',
          description: 'Verify state residency without exposing home address',
        },
      ]);
    } else if (templateType === 'senior') {
      setVerifierName('Bengaluru Metro Transit (BMRCL)');
      setPurpose('Concession Transit Pass Verification');
      setPurposeCode('TRANSIT_CONCESSION_PASS');
      setPredicates([
        {
          field: 'age',
          label: 'Senior Citizen Age Check',
          operator: 'GTE',
          targetValue: 60,
          description: 'Verify age >= 60 without revealing exact birthdate or identity number',
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateRequest({ verifierName, purpose, purposeCode, predicates });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="accent" className="border-indigo-500/30">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Create Bounded Verification Request</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Construct a signed verifier question contract. The citizen will evaluate predicates
            locally in their wallet.
          </p>
        </div>

        {/* Quick Templates */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Templates:</span>
          <button
            type="button"
            onClick={() => handleTemplateSelect('ev')}
            className="px-2.5 py-1 text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 rounded-lg hover:bg-indigo-900 cursor-pointer"
          >
            EV Subsidy
          </button>
          <button
            type="button"
            onClick={() => handleTemplateSelect('senior')}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 cursor-pointer"
          >
            Senior Transit
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Requesting Institution Name
            </label>
            <input
              type="text"
              value={verifierName}
              onChange={(e) => setVerifierName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Protocol Purpose Code
            </label>
            <input
              type="text"
              value={purposeCode}
              onChange={(e) => setPurposeCode(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-indigo-300 font-mono focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Public Purpose Description (Visible to Citizen)
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-indigo-500"
            required
          />
        </div>

        {/* Predicates List */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>Bounded Questions / Predicates ({predicates.length})</span>
            <span className="text-[10px] text-emerald-400 font-mono">
              PREDICATES ONLY — ZERO RAW PII DISCLOSURE
            </span>
          </label>

          <div className="space-y-2">
            {predicates.map((p, i) => (
              <div
                key={i}
                className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold text-white">{p.label}</span>
                    <span className="font-mono text-[11px] text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
                      {p.field} {p.operator} {String(p.targetValue)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Dispatch Signed Request to Citizen Wallet
          </Button>
        </div>
      </form>
    </Card>
  );
};
