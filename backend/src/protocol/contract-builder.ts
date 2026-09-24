/**
 * @fileoverview Verifier Request Contract Builder
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { RequestContract, DataRetentionPolicy, PROTOCOL_VERSION, Predicate } from '@pramana/shared';
import { generateNonce } from '../utils/nonce.js';

export interface BuildContractOptions {
  readonly verifierDid: string;
  readonly verifierName: string;
  readonly purpose: string;
  readonly context: string;
  readonly predicates: readonly Predicate[];
  readonly revealRequirements?: readonly string[];
  readonly retention?: DataRetentionPolicy;
  readonly ttlSeconds?: number;
}

export class ContractBuilder {
  static build(options: BuildContractOptions): RequestContract {
    const id = `urn:uuid:req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = Date.now();
    const ttl = (options.ttlSeconds ?? 120) * 1000;

    return {
      id,
      protocolVersion: PROTOCOL_VERSION,
      verifier: {
        did: options.verifierDid,
        name: options.verifierName,
      },
      purpose: options.purpose,
      context: options.context,
      predicates: options.predicates,
      revealRequirements: options.revealRequirements ?? [],
      retention: options.retention ?? 'AUDIT_RECEIPT_ONLY_ZERO_PII',
      nonce: generateNonce(32),
      issuedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttl).toISOString(),
    };
  }
}
