import React from 'react';
import { Badge } from './Badge';
import { RequestStatus } from '../../types/protocol';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export interface StatusBadgeProps {
  status: RequestStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="amber" icon={<Clock className="w-3 h-3 text-[#b06000]" />}>
          Pending Consent
        </Badge>
      );
    case 'CONSENTED':
      return (
        <Badge variant="indigo" icon={<CheckCircle2 className="w-3 h-3 text-[#0064e0]" />}>
          Consented
        </Badge>
      );
    case 'GENERATING_PROOF':
      return (
        <Badge variant="cyan" icon={<Loader2 className="w-3 h-3 animate-spin text-[#1a73e8]" />}>
          Generating Proof
        </Badge>
      );
    case 'VERIFIED':
      return (
        <Badge variant="emerald" icon={<CheckCircle2 className="w-3 h-3 text-[#137333]" />}>
          Verified Success
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="rose" icon={<XCircle className="w-3 h-3 text-[#c5221f]" />}>
          Declined
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge variant="neutral" icon={<Clock className="w-3 h-3 text-[#5d6c7b]" />}>
          Expired Request
        </Badge>
      );
  }
};

