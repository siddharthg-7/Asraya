/**
 * @fileoverview Trust Registry Foundations & Domain Models
 * Pramāṇa Protocol - Phase 2 Trust Registry & Institution Trust Layer
 *
 * Notice: The Trust Registry manages institutional trust anchors, schemas,
 * and authorizations. It is strictly FORBIDDEN from persisting citizen personal data.
 */

import { AttributeDefinition } from './attributes.js';

export type RegistryRecordStatus =
  'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPERIMENTAL' | 'DEPRECATED';

/**
 * 1. IssuerKey Record
 * Represents public key and authorization metadata for a trusted credential issuer.
 * Private key material MUST NEVER be stored in the registry.
 */
export interface IssuerKey {
  readonly did: string;
  readonly issuerId?: string | undefined;
  readonly legalName: string;
  readonly authorizedSchemas: readonly string[];
  readonly publicKeys: {
    readonly bbsG2PublicKey: string; // BLS12-381 G2 point (Base64/Hex)
    readonly keyId?: string | undefined;
    readonly revocationEndpoint?: string | undefined;
  };
  readonly validUntil?: string | undefined; // ISO 8601 UTC
  readonly status?: ('ACTIVE' | 'SUSPENDED' | 'REVOKED') | undefined;
  readonly active: boolean;
}

// Backward-compatible alias
export type IssuerRecord = IssuerKey;

/**
 * 2. VerifierLicence Record
 * Represents regulatory or network authorization for a verifier to request proofs.
 */
export interface VerifierLicence {
  readonly did: string;
  readonly verifierId?: string | undefined;
  readonly legalName: string;
  readonly permittedPurposes: readonly string[];
  readonly permittedPredicates: readonly string[];
  readonly permittedAttributes?: readonly string[] | undefined;
  readonly maxRetentionPolicy: string;
  readonly validUntil: string; // ISO 8601 UTC
  readonly status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  readonly issuedAt?: string | undefined;
}

/**
 * 3. AttributeDef Record
 * Alias for canonical AttributeDefinition. Describes semantic verifiable data elements.
 */
export type AttributeDef = AttributeDefinition;

/**
 * 4. Bridge Record
 * Describes mapping relationship between source legacy fields and canonical attributes.
 * NEVER contains citizen records or data.
 */
export interface BridgeDefinition {
  readonly bridgeId: string;
  readonly name?: string | undefined;
  readonly sourceSystem: string;
  readonly sourceField: string;
  readonly canonicalAttributeId: string;
  readonly transformRule: string; // Deterministic transformation descriptor
  readonly version?: string | undefined;
}

export type Bridge = BridgeDefinition;

/**
 * 5. AdapterManifest Record
 * Describes adapter capable of translating source system into canonical attributes.
 */
export interface AdapterManifest {
  readonly adapterId: string;
  readonly name?: string | undefined;
  readonly sourceFormat: 'SQL_RELATIONAL' | 'ISO20022_CAMT053' | 'REST_JSON' | string;
  readonly targetSchemaId: string;
  readonly version: string;
  readonly supportedAttributes: readonly string[];
  readonly status?: ('ACTIVE' | 'EXPERIMENTAL' | 'DEPRECATED') | undefined;
}

/**
 * 6. TemplateBundle Record
 * Provides structured consent prompt metadata (WHO, WHAT, NOT SHARED) for frontend rendering.
 */
export interface TemplateBundle {
  readonly templateId: string;
  readonly purposeCode: string;
  readonly locale: string; // e.g. 'en-US'
  readonly templateText: string;
  readonly parameterBindings: readonly string[];
  readonly version: string;
  readonly who?:
    | {
        readonly verifierId?: string | undefined;
        readonly role?: string | undefined;
        readonly legalEntity?: string | undefined;
      }
    | undefined;
  readonly what?:
    | {
        readonly requestedAttributes?: readonly string[] | undefined;
        readonly predicates?: readonly string[] | undefined;
      }
    | undefined;
  readonly notShared?: readonly string[] | undefined;
}

/**
 * 7. TrustCheckpoint Record
 * Represents a signed snapshot of the Trust Registry state at a specific epoch.
 */
export interface TrustCheckpoint {
  readonly epoch: number;
  readonly merkleRoot: string; // Merkle root digest of registry state
  readonly publishedAt: string; // ISO 8601 UTC
  readonly signature: string; // Multi-sig or root authority signature placeholder
  readonly checkpointAuthority?: string | undefined;
}

/**
 * Generic Trust Registry Record Container
 */
export interface RegistryRecord {
  readonly type:
    'ISSUER' | 'VERIFIER' | 'SCHEMA' | 'BRIDGE' | 'ADAPTER' | 'TEMPLATE' | 'CHECKPOINT';
  readonly id: string;
  readonly payload:
    | IssuerKey
    | VerifierLicence
    | AttributeDefinition
    | BridgeDefinition
    | AdapterManifest
    | TemplateBundle
    | TrustCheckpoint;
}
