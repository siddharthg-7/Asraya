/**
 * @fileoverview Verifier Request Contract Specification
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { Predicate } from './predicates.js';

export type DataRetentionPolicy =
  'NO_RETENTION_VERIFY_ONLY' | 'AUDIT_RECEIPT_ONLY_ZERO_PII' | 'TRANSIENT_SESSION_ONLY';

export interface VerifierIdentity {
  readonly did: string;
  readonly name: string;
  readonly registryEndpoint?: string | undefined;
}

export interface VerifierLicenceProof {
  readonly licenceId: string;
  readonly issuerRegistryCheckpoint: string;
  readonly signature: string;
  readonly validUntil: string; // ISO 8601 UTC
}

export interface RequestContract {
  /**
   * Unique contract identifier (UUIDv4)
   */
  readonly id: string;

  /**
   * Protocol specification version (e.g., '0.1.0')
   */
  readonly protocolVersion: string;

  /**
   * Identity of the requesting verifier
   */
  readonly verifier: VerifierIdentity;

  /**
   * Standardized regulatory purpose code (e.g. 'PURPOSE_AGE_VERIFICATION')
   */
  readonly purpose: string;

  /**
   * Domain / campaign context identifier used for nullifier generation
   */
  readonly context: string;

  /**
   * Bounded predicate assertions evaluated via zero-knowledge / selective disclosure
   */
  readonly predicates: readonly Predicate[];

  /**
   * Specific attributes requested for plain selective disclosure (must be strictly minimized)
   */
  readonly revealRequirements?: readonly string[] | undefined;

  /**
   * Canonical alias for revealRequirements per specification
   */
  readonly disclose?: readonly string[] | undefined;

  /**
   * Canonical alias for revealRequirements per specification
   */
  readonly disclosures?: readonly string[] | undefined;

  /**
   * Strict retention policy commitment by the verifier
   */
  readonly retention: DataRetentionPolicy;

  /**
   * Fresh 256-bit cryptographic nonce to prevent replay attacks
   */
  readonly nonce: string;

  /**
   * Request issuance timestamp (ISO 8601 UTC)
   */
  readonly issuedAt: string;

  /**
   * Absolute expiration timestamp (ISO 8601 UTC) - maximum lifetime 120s
   */
  readonly expiresAt: string;

  /**
   * Canonical alias for expiresAt per specification
   */
  readonly expiry?: string | undefined;

  /**
   * Ephemeral public key of the verifier for end-to-end payload encapsulation (HPKE)
   */
  readonly verifierEphemeralKey?: string | undefined;

  /**
   * Cryptographic proof of verifier licence issued by the trust registry
   */
  readonly verifierLicenceProof?: VerifierLicenceProof | undefined;

  /**
   * Canonical alias for verifierLicenceProof per specification
   */
  readonly licence?: VerifierLicenceProof | string | undefined;

  /**
   * Verifier digital signature sealing the request contract
   */
  readonly signature?: string | undefined;
}
