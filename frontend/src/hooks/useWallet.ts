/**
 * @fileoverview Wallet State Management Hook
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { useState } from 'react';
import { VerifiableCredential } from '@pramana/shared';

export interface WalletState {
  readonly isConnected: boolean;
  readonly credentials: readonly VerifiableCredential[];
  readonly activeRequests: readonly unknown[];
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: true,
    credentials: [],
    activeRequests: [],
  });

  const addCredential = (cred: VerifiableCredential) => {
    setState((prev) => ({
      ...prev,
      credentials: [...prev.credentials, cred],
    }));
  };

  return {
    ...state,
    addCredential,
  };
}
