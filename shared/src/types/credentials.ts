/**
 * @fileoverview Credential Abstraction & Holder Binding Types
 * Pramāṇa Protocol - Phase 1 Foundation
 */

export interface CredentialIssuer {
  readonly did: string;
  readonly name: string;
  readonly registryCheckpoint: string;
}

export interface CredentialMetadata {
  readonly id: string;
  readonly schemaId: string;
  readonly issuedAt: string; // ISO 8601 UTC
  readonly expiresAt?: string | undefined; // ISO 8601 UTC
  readonly revocationIndex?: number | undefined;
}

export interface HolderBindingCommitment {
  readonly holderPublicKeyHash: string;
  readonly algorithm: 'BLS12-381-G1' | 'ED25519';
}

export interface VerifiableCredential {
  readonly metadata: CredentialMetadata;
  readonly issuer: CredentialIssuer;
  readonly holderBinding: HolderBindingCommitment;
  readonly claims: Readonly<Record<string, string | number | boolean>>;
  readonly signature: string; // BBS+ multi-message signature over claims tuple
}

/**
 * Canonical Attribute Value emitted by an adapter after transformation
 */
export interface CanonicalAttributeValue {
  readonly attributeId: string;
  readonly value: string | number | boolean;
  readonly sourceAdapterId?: string | undefined;
  readonly bridgeId?: string | undefined;
}

/**
 * Minimal Claim Set issued for a citizen to satisfy a bounded request
 * Strictly excludes extraneous source database fields.
 */
export interface MinimalClaimSet {
  readonly schemaId: string;
  readonly issuerDid: string;
  readonly subjectId: string; // Synthetic citizen identifier
  readonly claims: Readonly<Record<string, string | number | boolean>>;
  readonly issuedAt: string; // ISO 8601 UTC
  readonly isMockUnsigned?: boolean | undefined; // Marked true in Phase 3 mock mode, false/omitted for real credentials
}
