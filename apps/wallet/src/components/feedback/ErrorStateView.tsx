import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProtocolErrorType } from '../../types/protocol';
import {
  AlertTriangle,
  Clock,
  XCircle,
  RefreshCw,
  ArrowLeft,
  WifiOff,
  ShieldAlert,
} from 'lucide-react';

export interface ErrorStateViewProps {
  type: ProtocolErrorType;
  title?: string;
  message?: string;
  onRecovery?: () => void;
  onBackToWallet?: () => void;
}

export const ErrorStateView: React.FC<ErrorStateViewProps> = ({
  type,
  title,
  message,
  onRecovery,
  onBackToWallet,
}) => {
  const configs: Record<
    ProtocolErrorType,
    { defaultTitle: string; defaultMsg: string; icon: React.ReactNode; badge: string }
  > = {
    EXPIRED_REQUEST: {
      defaultTitle: 'Verification Request Expired',
      defaultMsg:
        'This verification request timed out per protocol validity constraints. Please ask the verifier to issue a fresh request.',
      icon: <Clock className="w-10 h-10 text-amber-400" />,
      badge: 'REQUEST EXPIRED',
    },
    INVALID_REQUEST: {
      defaultTitle: 'Invalid Verification Contract',
      defaultMsg:
        'The verifier request payload signature or schema formatting is corrupted or unverified.',
      icon: <AlertTriangle className="w-10 h-10 text-rose-400" />,
      badge: 'SCHEMA ERROR',
    },
    CONSENT_DECLINED: {
      defaultTitle: 'Request Declined by Citizen',
      defaultMsg:
        'You declined to issue a zero-knowledge proof for this request. No data or proof was sent to the verifier.',
      icon: <XCircle className="w-10 h-10 text-slate-400" />,
      badge: 'CONSENT DECLINED',
    },
    PROOF_GENERATION_FAILED: {
      defaultTitle: 'Proof Generation Interrupted',
      defaultMsg:
        'Local predicate execution failed inside the hardware enclave. Ensure required certified credentials are valid.',
      icon: <ShieldAlert className="w-10 h-10 text-rose-400" />,
      badge: 'PROOF FAILED',
    },
    VERIFICATION_FAILED: {
      defaultTitle: 'Verification Requirements Not Satisfied',
      defaultMsg: 'One or more bounded predicate conditions failed local claim validation.',
      icon: <XCircle className="w-10 h-10 text-rose-400" />,
      badge: 'VERIFICATION FAILED',
    },
    NETWORK_UNAVAILABLE: {
      defaultTitle: 'Network / Transport Disconnected',
      defaultMsg: 'Unable to reach ephemeral transport relay. Check connection and retry.',
      icon: <WifiOff className="w-10 h-10 text-amber-400" />,
      badge: 'DISCONNECTED',
    },
    SESSION_EXPIRED: {
      defaultTitle: 'Verifier Session Expired',
      defaultMsg: 'The verifier session nonce has expired. Re-scan QR or request a new session.',
      icon: <Clock className="w-10 h-10 text-amber-400" />,
      badge: 'NONCE EXPIRED',
    },
  };

  const config = configs[type];

  return (
    <div className="max-w-md mx-auto my-12 animate-fade-in p-4">
      <Card variant="bordered" className="text-center p-8 border-slate-800 space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
          {config.icon}
        </div>

        <div>
          <Badge variant="rose" className="mb-3">
            {config.badge}
          </Badge>
          <h3 className="text-xl font-bold text-white mb-2">{title || config.defaultTitle}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{message || config.defaultMsg}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800">
          {onBackToWallet && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToWallet}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Wallet
            </Button>
          )}

          {onRecovery && (
            <Button
              variant="primary"
              size="sm"
              onClick={onRecovery}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Action
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
