/**
 * @fileoverview Phase 4 Integration Tests: Request -> Policy -> Consent Flow
 * Pramāṇa Protocol - End-to-End Pipeline & Phase 3 Interoperability
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../backend/src/server.js';
import { PROTOCOL_VERSION, CANONICAL_ATTRIBUTES } from '../../shared/src/index.js';
import { mediationService } from '../../backend/src/services/mediation.service.js';
import { SYNTHETIC_ALICE } from '../../backend/src/fixtures/synthetic-data.js';

describe('Phase 4 Integration Tests: Fuel Subsidy Pipeline', () => {
  let server: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('should execute complete subsidy request -> policy -> consent -> approval flow', async () => {
    // ------------------------------------------------------------------------
    // Step 0: Confirm Phase 3 Schema Mediation can supply the required attributes
    // ------------------------------------------------------------------------
    const subsidyRequest = {
      id: 'urn:uuid:req-fuel-subsidy-2026-integration',
      protocolVersion: PROTOCOL_VERSION,
      verifier: {
        did: 'did:pramana:verifier:fuel-subsidy-01',
        name: 'Municipal Fuel Subsidy Authority (Claimed)',
      },
      purpose: 'fuel_subsidy_eligibility',
      context: 'commercial-driver-relief-q1',
      predicates: [
        {
          attributeId: CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
          operator: 'LTE',
          constant: 300000,
        },
        {
          attributeId: CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
          operator: 'EQ',
          constant: 'ACTIVE',
        },
      ],
      revealRequirements: [CANONICAL_ATTRIBUTES.DISTRICT],
      retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
      nonce: 'f1e2d3c4b5a60718293a4b5c6d7e8f00112233445566778899aabbccddeeff00',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 120000).toISOString(),
    };

    const requiredAttrs = mediationService.getRequiredAttributes(subsidyRequest as any);
    expect(requiredAttrs).toContain(CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS);
    expect(requiredAttrs).toContain(CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS);

    // Mediate claims from Alice's heterogeneous source data
    const mediatedClaimSet = await mediationService.mediateForRequest(
      subsidyRequest as any,
      'did:pramana:issuer:bank-reg-authority',
      'citizen:synthetic:alice',
      {
        bankCamt053: SYNTHETIC_ALICE.bankCamt053,
        transportSql: SYNTHETIC_ALICE.transportSql,
      },
    );
    expect(Object.keys(mediatedClaimSet.claims).length).toBeGreaterThanOrEqual(1);

    // ------------------------------------------------------------------------
    // Step 1: Validate Request Contract via HTTP API
    // ------------------------------------------------------------------------
    const validateRes = await server.inject({
      method: 'POST',
      url: '/api/v1/requests/validate',
      payload: subsidyRequest,
    });
    expect(validateRes.statusCode).toBe(200);
    const validateBody = JSON.parse(validateRes.body);
    expect(validateBody.valid).toBe(true);
    expect(validateBody.requestContract.id).toBe(subsidyRequest.id);

    // ------------------------------------------------------------------------
    // Step 2: Evaluate Policy via HTTP API against Trust Registry
    // ------------------------------------------------------------------------
    const policyRes = await server.inject({
      method: 'POST',
      url: '/api/v1/requests/policy',
      payload: subsidyRequest,
    });
    expect(policyRes.statusCode).toBe(200);
    const policyBody = JSON.parse(policyRes.body);
    expect(policyBody.status).toBe('AUTHORIZED');
    expect(policyBody.authorized).toBe(true);
    expect(policyBody.verifierDid).toBe('did:pramana:verifier:fuel-subsidy-01');

    // ------------------------------------------------------------------------
    // Step 3: Prepare Structured Consent Information (WHO, WHAT, NOT SHARED)
    // ------------------------------------------------------------------------
    const consentRes = await server.inject({
      method: 'POST',
      url: '/api/v1/consent/prepare',
      payload: subsidyRequest,
    });
    expect(consentRes.statusCode).toBe(200);
    const consentInfo = JSON.parse(consentRes.body);

    // WHO check: Anchored in Trust Registry legalName
    expect(consentInfo.who.verifierDid).toBe('did:pramana:verifier:fuel-subsidy-01');
    expect(consentInfo.who.verifierName).toBe('Municipal Fuel Subsidy Authority');

    // WHAT check: Disclosed values separated from zero-knowledge proven predicates
    expect(consentInfo.what.disclosedAttributes).toHaveLength(1);
    expect(consentInfo.what.disclosedAttributes[0].name).toBe('district');
    expect(consentInfo.what.predicates).toHaveLength(2);

    // NOT SHARED check: Explicitly protected attributes remain private
    expect(consentInfo.notShared).toContain('bank_account_number');
    expect(consentInfo.notShared).toContain('transaction_history');
    expect(consentInfo.notShared).toContain('exact_earnings_amount');
    expect(consentInfo.notShared).toContain('residential_address');

    // STATE check: Citizen consent begins strictly as PENDING
    expect(consentInfo.citizenConsentStatus).toBe('PENDING');

    // BINDING check: Binds strictly to request nonce
    expect(consentInfo.requestId).toBe(subsidyRequest.id);
    expect(consentInfo.requestNonce).toBe(subsidyRequest.nonce);

    // ------------------------------------------------------------------------
    // Step 4: Citizen Wallet Confirms Explicit Consent
    // ------------------------------------------------------------------------
    const decisionRes = await server.inject({
      method: 'POST',
      url: '/api/v1/consent/decision',
      payload: {
        requestId: subsidyRequest.id,
        requestNonce: subsidyRequest.nonce,
        decision: 'APPROVED',
      },
    });
    expect(decisionRes.statusCode).toBe(200);
    const decisionBody = JSON.parse(decisionRes.body);
    expect(decisionBody.decision).toBe('APPROVED');
    expect(decisionBody.requestId).toBe(subsidyRequest.id);
    expect(decisionBody.requestNonce).toBe(subsidyRequest.nonce);

    // ------------------------------------------------------------------------
    // Step 5: Verify Querying Consent Decision by Request Nonce Binding
    // ------------------------------------------------------------------------
    const getDecisionRes = await server.inject({
      method: 'GET',
      url: `/api/v1/consent/decision/${subsidyRequest.id}/${subsidyRequest.nonce}`,
    });
    expect(getDecisionRes.statusCode).toBe(200);
    const getDecisionBody = JSON.parse(getDecisionRes.body);
    expect(getDecisionBody.decision).toBe('APPROVED');
  });

  it('should reject unauthorized over-asking request during integration pipeline', async () => {
    const overAskingRequest = {
      id: 'urn:uuid:req-overasking-01',
      protocolVersion: PROTOCOL_VERSION,
      verifier: {
        did: 'did:pramana:verifier:venue-access-01',
        name: 'Venue Access Control Ltd',
      },
      purpose: 'PURPOSE_AGE_VERIFICATION',
      context: 'venue-entry',
      predicates: [
        {
          attributeId: CANONICAL_ATTRIBUTES.AGE,
          operator: 'LTE',
          constant: 25,
        },
      ],
      revealRequirements: [],
      retention: 'TRANSIENT_SESSION_ONLY', // Over-asking retention: exceeds Venue Access licence limit!
      nonce: 'a1b2c3d4e5f60718293a4b5c6d7e8f00112233445566778899aabbccddeeff11',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 120000).toISOString(),
    };

    const policyRes = await server.inject({
      method: 'POST',
      url: '/api/v1/requests/policy',
      payload: overAskingRequest,
    });
    expect(policyRes.statusCode).toBe(400);
    const body = JSON.parse(policyRes.body);
    expect(body.code).toBe('DATA_MINIMIZATION_VIOLATION');
  });
});
