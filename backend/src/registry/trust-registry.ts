/**
 * @fileoverview Trust Registry Service & Resolution Interface
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Notice: Strictly maintains institutional trust anchors and schemas.
 * NEVER stores citizen data.
 */

import {
  IssuerRecord,
  VerifierLicence,
  AttributeDefinition,
  TrustCheckpoint,
  TemplateBundle,
} from '@pramana/shared';

export interface ITrustRegistry {
  getIssuer(did: string): Promise<IssuerRecord | null>;
  getVerifierLicence(did: string): Promise<VerifierLicence | null>;
  getAttributeDefinition(id: string): Promise<AttributeDefinition | null>;
  getTemplate(purposeCode: string, locale: string): Promise<TemplateBundle | null>;
  getLatestCheckpoint(): Promise<TrustCheckpoint>;
}

export class InMemoryTrustRegistry implements ITrustRegistry {
  private readonly issuers = new Map<string, IssuerRecord>();
  private readonly verifiers = new Map<string, VerifierLicence>();
  private readonly attributes = new Map<string, AttributeDefinition>();
  private readonly templates = new Map<string, TemplateBundle>();

  constructor() {
    this.seedDefaultRegistryData();
  }

  private seedDefaultRegistryData(): void {
    // Seed standard demonstration issuer
    this.issuers.set('did:pramana:issuer:gov-civil-dept', {
      did: 'did:pramana:issuer:gov-civil-dept',
      legalName: 'Civil Registration Department',
      authorizedSchemas: ['urn:pramana:schema:civil:identity:v1'],
      publicKeys: {
        bbsG2PublicKey: 'bls12381_g2_mock_public_key_anchor',
      },
      active: true,
    });

    // Seed standard demonstration verifier
    this.verifiers.set('did:pramana:verifier:venue-access-01', {
      did: 'did:pramana:verifier:venue-access-01',
      legalName: 'Venue Access Control Ltd',
      permittedPurposes: ['PURPOSE_AGE_VERIFICATION'],
      permittedPredicates: ['urn:pramana:attr:civil:age'],
      maxRetentionPolicy: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
      validUntil: '2030-01-01T00:00:00Z',
      status: 'ACTIVE',
    });

    // Seed standard template bundle
    this.templates.set('PURPOSE_AGE_VERIFICATION:en-US', {
      templateId: 'tmpl-age-verify-v1',
      purposeCode: 'PURPOSE_AGE_VERIFICATION',
      locale: 'en-US',
      templateText:
        '{{verifier_name}} is requesting to verify that you are at least 18 years old. Your date of birth, name, and address will NOT be shared.',
      parameterBindings: ['verifier_name'],
      version: '1.0.0',
    });
  }

  async getIssuer(did: string): Promise<IssuerRecord | null> {
    return this.issuers.get(did) ?? null;
  }

  async getVerifierLicence(did: string): Promise<VerifierLicence | null> {
    return this.verifiers.get(did) ?? null;
  }

  async getAttributeDefinition(id: string): Promise<AttributeDefinition | null> {
    return this.attributes.get(id) ?? null;
  }

  async getTemplate(purposeCode: string, locale: string): Promise<TemplateBundle | null> {
    const key = `${purposeCode}:${locale}`;
    return this.templates.get(key) ?? this.templates.get(`${purposeCode}:en-US`) ?? null;
  }

  async getLatestCheckpoint(): Promise<TrustCheckpoint> {
    return {
      epoch: 1,
      merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      publishedAt: new Date().toISOString(),
      signature: 'checkpoint_root_authority_signature_placeholder',
    };
  }
}

export const trustRegistry = new InMemoryTrustRegistry();
