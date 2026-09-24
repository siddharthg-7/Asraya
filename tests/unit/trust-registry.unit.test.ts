/**
 * @fileoverview Trust Registry & Institution Trust Layer Unit Tests
 * Pramāṇa Protocol - Phase 2 Mandatory Invariant & Gate Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { trustRegistry, checkpointVerifier } from '../../backend/src/registry/trust-registry.js';
import { registryService } from '../../backend/src/services/registry.service.js';
import { buildServer } from '../../backend/src/server.js';
import {
  CANONICAL_ATTRIBUTES,
  validateIssuerKey,
  validateVerifierLicence,
  validateAttributeDef,
  validateBridge,
  validateAdapterManifest,
  validateTemplateBundle,
  validateTrustCheckpoint,
  assertNoPrivateKeyMaterial,
  assertNoCitizenData,
  IssuerKey,
  VerifierLicence,
  AttributeDefinition,
  BridgeDefinition,
  AdapterManifest,
  TemplateBundle,
  TrustCheckpoint,
  PramanaError,
  PROTOCOL_VERSION,
} from '../../shared/src/index.js';

describe('Phase 2: Trust Registry & Institution Trust Layer Tests', () => {
  let server: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  // ==========================================================================
  // 1. ISSUER TESTS
  // ==========================================================================
  describe('1. Issuer Key Registry', () => {
    it('1. issuer lookup succeeds for registered issuer', async () => {
      const issuer = await registryService.getIssuer('did:pramana:issuer:gov-civil-dept');
      expect(issuer).not.toBeNull();
      expect(issuer?.legalName).toBe('Civil Registration Department');
      expect(issuer?.active).toBe(true);
      expect(issuer?.publicKeys.bbsG2PublicKey).toBeTruthy();
    });

    it('2. unknown issuer rejected with null or 404', async () => {
      const issuer = await registryService.getIssuer('did:pramana:issuer:non-existent-authority');
      expect(issuer).toBeNull();

      const res = await server.inject({
        method: 'GET',
        url: '/api/v1/registry/issuers/did:pramana:issuer:non-existent-authority',
      });
      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.code).toBe('REGISTRY_LOOKUP_FAILED');
    });

    it('13a. malformed issuer record rejected by validator', () => {
      expect(() => {
        validateIssuerKey({
          did: '',
          legalName: 'Malformed Dept',
          authorizedSchemas: [],
          publicKeys: {},
        });
      }).toThrow();
    });
  });

  // ==========================================================================
  // 2. VERIFIER LICENCE TESTS
  // ==========================================================================
  describe('2. Verifier Licence Registry', () => {
    it('3. verifier licence lookup succeeds for licensed verifier', async () => {
      const licence = await registryService.getVerifierLicence(
        'did:pramana:verifier:venue-access-01',
      );
      expect(licence).not.toBeNull();
      expect(licence?.legalName).toBe('Venue Access Control Ltd');
      expect(licence?.status).toBe('ACTIVE');
      expect(licence?.permittedPurposes).toContain('PURPOSE_AGE_VERIFICATION');
    });

    it('4. invalid verifier licence rejected (unknown, expired, suspended, revoked)', async () => {
      // Unknown verifier
      const unknown = await registryService.getVerifierLicence(
        'did:pramana:verifier:unknown-entity',
      );
      expect(unknown).toBeNull();

      // Expired verifier
      const expired = await registryService.getVerifierLicence('did:pramana:verifier:expired-01');
      expect(expired).not.toBeNull();
      expect(new Date(expired!.validUntil).getTime()).toBeLessThan(Date.now());

      // Suspended verifier
      const suspended = await registryService.getVerifierLicence(
        'did:pramana:verifier:suspended-01',
      );
      expect(suspended?.status).toBe('SUSPENDED');

      // Revoked verifier
      const revoked = await registryService.getVerifierLicence('did:pramana:verifier:revoked-01');
      expect(revoked?.status).toBe('REVOKED');
    });

    it('13b. malformed verifier licence rejected by validator', () => {
      expect(() => {
        validateVerifierLicence({
          did: 'did:pramana:verifier:test',
          legalName: '',
          permittedPurposes: [],
          maxRetentionPolicy: '',
          validUntil: 'invalid-date',
          status: 'INVALID_STATUS',
        });
      }).toThrow();
    });
  });

  // ==========================================================================
  // 3. CANONICAL ATTRIBUTE DEFINITIONS TESTS
  // ==========================================================================
  describe('3. Canonical Attribute Registry', () => {
    it('5. canonical attribute lookup succeeds for standard attributes', async () => {
      const ageAttr = await registryService.getAttributeDefinition(CANONICAL_ATTRIBUTES.AGE);
      expect(ageAttr).not.toBeNull();
      expect(ageAttr?.name).toBe('age');
      expect(ageAttr?.category).toBe('civil');
      expect(ageAttr?.dataType).toBe('number');

      const earningsAttr = await registryService.getAttributeDefinition(
        CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
      );
      expect(earningsAttr).not.toBeNull();
      expect(earningsAttr?.name).toBe('trailing_12m_earnings');
      expect(earningsAttr?.category).toBe('financial');

      const permitAttr = await registryService.getAttributeDefinition(
        CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
      );
      expect(permitAttr).not.toBeNull();
      expect(permitAttr?.name).toBe('commercial_permit_status');
      expect(permitAttr?.category).toBe('transport');
    });

    it('6. unknown canonical attribute rejected', async () => {
      const unknown = await registryService.getAttributeDefinition(
        'urn:pramana:attr:custom:arbitrary_legacy_db_col',
      );
      expect(unknown).toBeNull();

      const res = await server.inject({
        method: 'GET',
        url: '/api/v1/registry/attributes/urn:pramana:attr:custom:arbitrary_legacy_db_col',
      });
      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.code).toBe('ATTRIBUTE_NOT_SUPPORTED');
    });

    it('lists canonical attributes by category', async () => {
      const civilAttrs = await registryService.listAttributes('civil');
      expect(civilAttrs.length).toBeGreaterThan(0);
      expect(civilAttrs.every((a) => a.category === 'civil')).toBe(true);

      const allAttrs = await registryService.listAttributes();
      expect(allAttrs.length).toBeGreaterThanOrEqual(10);
    });
  });

  // ==========================================================================
  // 4. BRIDGE METADATA TESTS
  // ==========================================================================
  describe('4. Bridge Registry', () => {
    it('7. bridge lookup succeeds for registered bridge', async () => {
      const bridge = await registryService.getBridge('bridge:bank:camt053-to-trailing12m');
      expect(bridge).not.toBeNull();
      expect(bridge?.sourceSystem).toBe('CORE_BANKING_ISO20022');
      expect(bridge?.sourceField).toBe('BkToCstmrStmt.Stmt.Bal.Amt');
      expect(bridge?.canonicalAttributeId).toBe(CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS);
    });

    it('8. unknown bridge rejected', async () => {
      const unknown = await registryService.getBridge('bridge:unknown:does-not-exist');
      expect(unknown).toBeNull();

      const res = await server.inject({
        method: 'GET',
        url: '/api/v1/registry/bridges/bridge:unknown:does-not-exist',
      });
      expect(res.statusCode).toBe(404);
    });

    it('resolves bridges for a specific canonical attribute', async () => {
      const bridges = await registryService.getBridgesForAttribute(
        CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
      );
      expect(bridges.length).toBeGreaterThan(0);
      expect(bridges[0].canonicalAttributeId).toBe(CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS);
    });
  });

  // ==========================================================================
  // 5. ADAPTER MANIFEST TESTS
  // ==========================================================================
  describe('5. Adapter Manifest Registry', () => {
    it('9. adapter manifest lookup succeeds for registered adapter', async () => {
      const adapter = await registryService.getAdapter('adapter:banking:iso20022-camt053');
      expect(adapter).not.toBeNull();
      expect(adapter?.sourceFormat).toBe('ISO20022_CAMT053');
      expect(adapter?.supportedAttributes).toContain(CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS);
    });

    it('10. unknown adapter rejected', async () => {
      const unknown = await registryService.getAdapter('adapter:unknown:does-not-exist');
      expect(unknown).toBeNull();

      const res = await server.inject({
        method: 'GET',
        url: '/api/v1/registry/adapters/adapter:unknown:does-not-exist',
      });
      expect(res.statusCode).toBe(404);
    });

    it('resolves adapters capable of providing a canonical attribute', async () => {
      const adapters = await registryService.getAdaptersForAttribute(CANONICAL_ATTRIBUTES.AGE);
      expect(adapters.length).toBeGreaterThan(0);
      expect(adapters[0].adapterId).toBe('adapter:civil:sql-relational');
    });
  });

  // ==========================================================================
  // 6. TEMPLATE BUNDLE TESTS
  // ==========================================================================
  describe('6. Template Bundle Registry', () => {
    it('11. template lookup succeeds for valid purpose code and locale', async () => {
      const tmpl = await registryService.getTemplate('PURPOSE_AGE_VERIFICATION', 'en-US');
      expect(tmpl).not.toBeNull();
      expect(tmpl?.purposeCode).toBe('PURPOSE_AGE_VERIFICATION');
      expect(tmpl?.templateText).toContain('{{verifier_name}}');
      expect(tmpl?.who?.role).toBeTruthy();
      expect(tmpl?.what?.requestedAttributes).toBeTruthy();
      expect(tmpl?.notShared).toContain('date_of_birth');
    });

    it('12. unknown template rejected', async () => {
      const unknown = await registryService.getTemplate('PURPOSE_UNKNOWN_CAMPAIGN', 'fr-FR');
      expect(unknown).toBeNull();

      const res = await server.inject({
        method: 'GET',
        url: '/api/v1/registry/templates/PURPOSE_UNKNOWN_CAMPAIGN?locale=fr-FR',
      });
      expect(res.statusCode).toBe(404);
    });
  });

  // ==========================================================================
  // 7. SECURITY & DATA MINIMIZATION GUARDRAIL TESTS
  // ==========================================================================
  describe('7. Security Controls & Data Minimization', () => {
    it('14. private key material rejected from registry records', () => {
      // Attempting to register an issuer with an embedded private key field
      const maliciousIssuer: any = {
        did: 'did:pramana:issuer:rogue-01',
        legalName: 'Rogue Authority',
        authorizedSchemas: ['urn:pramana:schema:civil:identity:v1'],
        publicKeys: {
          bbsG2PublicKey: 'valid_mock_public_key',
        },
        privateKey: 'MIICXAIBAAKCAQEA0Y9...', // FORBIDDEN!
        active: true,
      };

      expect(() => validateIssuerKey(maliciousIssuer)).toThrow(
        /SECURITY_VIOLATION_PRIVATE_KEY_PROHIBITED/,
      );
      expect(() => assertNoPrivateKeyMaterial(maliciousIssuer)).toThrow(
        /SECURITY_VIOLATION_PRIVATE_KEY_PROHIBITED/,
      );

      // Attempting to register private key via PEM string
      const pemRecord = {
        name: 'test',
        keyData: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...',
      };
      expect(() => assertNoPrivateKeyMaterial(pemRecord)).toThrow(
        /SECURITY_VIOLATION_PRIVATE_KEY_PROHIBITED/,
      );
    });

    it('15. citizen PII rejected from registry records', () => {
      // Inappropriate raw citizen claims injected into registry records
      const recordWithIncome: any = {
        did: 'did:pramana:issuer:test',
        legalName: 'Test Issuer',
        authorizedSchemas: ['urn:pramana:schema:test'],
        publicKeys: { bbsG2PublicKey: 'pubkey' },
        income: 150000, // CITIZEN DATA - FORBIDDEN IN REGISTRY!
      };

      expect(() => validateIssuerKey(recordWithIncome)).toThrow(
        /DATA_MINIMIZATION_VIOLATION_PII_PROHIBITED/,
      );

      const recordWithBankStatement = {
        bridgeId: 'bridge:test',
        sourceSystem: 'BANK',
        sourceField: 'field',
        canonicalAttributeId: 'urn:pramana:attr:fin:annual_income',
        transformRule: 'rule',
        bankStatement: 'John Doe Account Balance: $50,000', // CITIZEN DATA - FORBIDDEN!
      };
      expect(() => validateBridge(recordWithBankStatement)).toThrow(
        /DATA_MINIMIZATION_VIOLATION_PII_PROHIBITED/,
      );

      const recordWithAadhaar = {
        templateId: 'tmpl:test',
        purposeCode: 'TEST',
        locale: 'en-US',
        templateText: 'Text',
        parameterBindings: [],
        version: '1.0.0',
        aadhaar: '1234-5678-9012', // CITIZEN DATA - FORBIDDEN!
      };
      expect(() => validateTemplateBundle(recordWithAadhaar)).toThrow(
        /DATA_MINIMIZATION_VIOLATION_PII_PROHIBITED/,
      );
    });

    it('20. data minimization: attribute definition is allowed, but raw citizen attribute values are rejected', () => {
      // An attribute definition describing "annual_income" is legitimate metadata:
      const legitimateAttributeDef: AttributeDefinition = {
        id: 'urn:pramana:attr:fin:annual_income',
        name: 'annual_income',
        category: 'financial',
        dataType: 'number',
        description: 'Citizen verified annual gross income',
        schemaId: 'urn:pramana:schema:fin:earnings:v1',
      };
      expect(() => validateAttributeDef(legitimateAttributeDef)).not.toThrow();

      // But an object carrying a citizen's actual income value is rejected:
      const citizenRecord = {
        id: 'citizen:record:01',
        fullName: 'Jane Doe',
        income: 85000,
        address: '123 Privacy Lane',
      };
      expect(() => assertNoCitizenData(citizenRecord)).toThrow(
        /DATA_MINIMIZATION_VIOLATION_PII_PROHIBITED/,
      );
    });

    it('19. checkpoint cryptographic verification throws NOT IMPLEMENTED', async () => {
      const checkpoint = await registryService.getLatestCheckpoint();
      expect(checkpoint.epoch).toBe(1);
      expect(checkpoint.merkleRoot).toBeTruthy();

      await expect(registryService.verifyCheckpoint(checkpoint)).rejects.toThrow(
        /NOT IMPLEMENTED — Checkpoint cryptographic signature verification is deferred to Phase 5/,
      );

      const res = await server.inject({
        method: 'POST',
        url: '/api/v1/registry/checkpoint/verify',
        payload: checkpoint,
      });
      expect(res.statusCode).toBe(501);
      const body = JSON.parse(res.body);
      expect(body.code).toBe('NOT_IMPLEMENTED');
    });
  });

  // ==========================================================================
  // 8. REGISTRY + REQUEST CONTRACT INTEGRATION TESTS
  // ==========================================================================
  describe('8. Registry + RequestContract Integration Gates', () => {
    it('16. request with unregistered attribute rejected', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/v1/requests',
        payload: {
          verifierDid: 'did:pramana:verifier:venue-access-01',
          verifierName: 'Venue Access Control Ltd',
          purpose: 'PURPOSE_AGE_VERIFICATION',
          context: 'venue-entry',
          predicates: [
            {
              attributeId: 'urn:pramana:attr:custom:unregistered_credit_score_hack',
              operator: 'LTE',
              constant: 750,
            },
          ],
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.code).toBe('ATTRIBUTE_NOT_SUPPORTED');
      expect(body.message).toContain('not registered in Trust Registry');
    });

    it('17. request with invalid verifier licence rejected (unknown, expired, suspended, revoked)', async () => {
      // Case A: Unknown Verifier DID
      const resUnknown = await server.inject({
        method: 'POST',
        url: '/api/v1/requests',
        payload: {
          verifierDid: 'did:pramana:verifier:unlicensed-intruder',
          verifierName: 'Unknown Hacker Org',
          purpose: 'PURPOSE_AGE_VERIFICATION',
          context: 'test',
          predicates: [
            {
              attributeId: 'urn:pramana:attr:civil:age',
              operator: 'LTE',
              constant: 18,
            },
          ],
        },
      });
      expect(resUnknown.statusCode).toBe(403);
      expect(JSON.parse(resUnknown.body).code).toBe('LICENCE_INVALID');

      // Case B: Expired Verifier Licence
      const resExpired = await server.inject({
        method: 'POST',
        url: '/api/v1/requests',
        payload: {
          verifierDid: 'did:pramana:verifier:expired-01',
          verifierName: 'Expired Merchant Corp',
          purpose: 'PURPOSE_AGE_VERIFICATION',
          context: 'test',
          predicates: [
            {
              attributeId: 'urn:pramana:attr:civil:age',
              operator: 'LTE',
              constant: 18,
            },
          ],
        },
      });
      expect(resExpired.statusCode).toBe(403);
      expect(JSON.parse(resExpired.body).message).toContain('expired');

      // Case C: Suspended Verifier Licence
      const resSuspended = await server.inject({
        method: 'POST',
        url: '/api/v1/requests',
        payload: {
          verifierDid: 'did:pramana:verifier:suspended-01',
          verifierName: 'Suspended Gaming Portal Ltd',
          purpose: 'PURPOSE_AGE_VERIFICATION',
          context: 'test',
          predicates: [
            {
              attributeId: 'urn:pramana:attr:civil:age',
              operator: 'LTE',
              constant: 18,
            },
          ],
        },
      });
      expect(resSuspended.statusCode).toBe(403);
      expect(JSON.parse(resSuspended.body).message).toContain('SUSPENDED');

      // Case D: Revoked Verifier Licence
      const resRevoked = await server.inject({
        method: 'POST',
        url: '/api/v1/requests',
        payload: {
          verifierDid: 'did:pramana:verifier:revoked-01',
          verifierName: 'Fraudulent Verifier Corp',
          purpose: 'PURPOSE_AGE_VERIFICATION',
          context: 'test',
          predicates: [
            {
              attributeId: 'urn:pramana:attr:civil:age',
              operator: 'LTE',
              constant: 18,
            },
          ],
        },
      });
      expect(resRevoked.statusCode).toBe(403);
      expect(JSON.parse(resRevoked.body).message).toContain('REVOKED');
    });

    it('18. valid request resolves registry references successfully', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/v1/requests',
        payload: {
          verifierDid: 'did:pramana:verifier:venue-access-01',
          verifierName: 'Venue Access Control Ltd',
          purpose: 'PURPOSE_AGE_VERIFICATION',
          context: 'club-night-entry',
          predicates: [
            {
              attributeId: 'urn:pramana:attr:civil:age',
              operator: 'LTE',
              constant: 21,
            },
          ],
        },
      });

      expect(res.statusCode).toBe(201);
      const contract = JSON.parse(res.body);
      expect(contract.verifier.did).toBe('did:pramana:verifier:venue-access-01');
      expect(contract.purpose).toBe('PURPOSE_AGE_VERIFICATION');
      expect(contract.predicates[0].attributeId).toBe('urn:pramana:attr:civil:age');
      expect(contract.nonce).toHaveLength(64);
    });

    it('validates a complete RequestContract via /api/v1/registry/validate-request', async () => {
      // Build a valid request contract structure
      const validPayload = {
        id: 'req_test_1234567890abcdef',
        protocolVersion: PROTOCOL_VERSION,
        verifier: {
          did: 'did:pramana:verifier:fin-eval-01',
          name: 'Micro-Credit Assessment Ltd',
          serviceEndpoint: 'https://verifier.microcredit.example.com/callback',
        },
        purpose: 'PURPOSE_INCOME_CHECK',
        context: 'loan-application-q4',
        predicates: [
          {
            attributeId: 'urn:pramana:attr:fin:trailing_12m_earnings',
            operator: 'LTE',
            constant: 500000,
          },
        ],
        retention: 'TRANSIENT_SESSION_ONLY',
        nonce: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
      };

      const resValid = await server.inject({
        method: 'POST',
        url: '/api/v1/registry/validate-request',
        payload: validPayload,
      });

      expect(resValid.statusCode).toBe(200);
      const body = JSON.parse(resValid.body);
      expect(body.valid).toBe(true);
      expect(body.verifier).toBe('Micro-Credit Assessment Ltd');
    });
  });
});
