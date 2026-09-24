/**
 * @fileoverview Trust Registry Foundations & Domain Models
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Notice: The Trust Registry manages institutional trust anchors, schemas,
 * and authorizations. It is strictly FORBIDDEN from persisting citizen personal data.
 */

import { AttributeDefinition } from './attributes.js';

export interface IssuerRecord {
  readonly did: string;
  readonly legalName: string;
  readonly authorizedSchemas: readonly string[];
  readonly publicKeys: {
    readonly bbsG2PublicKey: string; // BLS12-381 G2 point (Base64/Hex)
    readonly revocationEndpoint?: string;
  };
  readonly active: boolean;
}

export interface VerifierLicence {
  readonly did: string;
  readonly legalName: string;
  readonly permittedPurposes: readonly string[];
  readonly permittedPredicates: readonly string[];
  readonly maxRetentionPolicy: string;
  readonly validUntil: string; // ISO 8601 UTC
  readonly status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
}

export interface AdapterManifest {
  readonly adapterId: string;
  readonly sourceFormat: 'SQL_RELATIONAL' | 'ISO20022_CAMT053' | 'REST_JSON';
  readonly targetSchemaId: string;
  readonly version: string;
  readonly supportedAttributes: readonly string[];
}

export interface BridgeDefinition {
  readonly bridgeId: string;
  readonly sourceField: string;
  readonly canonicalAttributeId: string;
  readonly transformRule: string; // Deterministic transformation descriptor
}

export interface TemplateBundle {
  readonly templateId: string;
  readonly purposeCode: string;
  readonly locale: string; // e.g. 'en-US'
  readonly templateText: string;
  readonly parameterBindings: readonly string[];
  readonly version: string;
}

export interface TrustCheckpoint {
  readonly epoch: number;
  readonly merkleRoot: string; // Merkle root digest of registry state
  readonly publishedAt: string; // ISO 8601 UTC
  readonly signature: string; // Multi-sig or root authority signature
}

export interface RegistryRecord {
  readonly type: 'ISSUER' | 'VERIFIER' | 'SCHEMA' | 'TEMPLATE' | 'CHECKPOINT';
  readonly id: string;
  readonly payload:
    IssuerRecord | VerifierLicence | AttributeDefinition | TemplateBundle | TrustCheckpoint;
}
