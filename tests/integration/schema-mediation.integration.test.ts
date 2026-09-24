/**
 * @fileoverview End-to-End Schema Mediation & Heterogeneous Data Interoperability Integration Tests
 * Pramāṇa Protocol - Phase 3 Schema Mediation
 *
 * Demonstrates:
 *
 * Synthetic Bank CAMT.053
 *           │
 *           ▼
 *    CAMT Adapter
 *           │
 *           ▼
 *  trailing_12m_earnings
 *           │
 *           ▼
 *     Minimal Claim
 *
 * and:
 *
 * Synthetic Transport SQL
 *           │
 *           ▼
 *     SQL Adapter
 *           │
 *           ▼
 *  commercial_permit_status
 *           │
 *           ▼
 *     Minimal Claim
 *
 * and:
 *
 * Synthetic Municipal REST
 *           │
 *           ▼
 *     REST Adapter
 *           │
 *           ▼
 *    canonical attribute
 *
 * Proving that the verifier does not know or care that these attributes
 * originated from three completely different institutional systems.
 */

import { describe, it, expect } from 'vitest';
import { mediationService } from '../../backend/src/services/mediation.service.js';
import {
  mockIssuerService,
  SourceDataContainer,
} from '../../backend/src/issuers/issuer-service.js';
import {
  SYNTHETIC_ALICE,
  SYNTHETIC_BOB,
  SYNTHETIC_CAROL,
  SYNTHETIC_DAVE,
} from '../../backend/src/fixtures/synthetic-data.js';
import { CANONICAL_ATTRIBUTES, RequestContract, PROTOCOL_VERSION } from '../../shared/src/index.js';

describe('Phase 3 Integration: Heterogeneous Data Interoperability', () => {
  it('demonstrates three heterogeneous systems speaking one canonical language', async () => {
    // ------------------------------------------------------------------------
    // System 1: Bank ISO 20022 CAMT.053 XML / Statement Object
    // ------------------------------------------------------------------------
    const bankSources: SourceDataContainer = {
      bankCamt053: SYNTHETIC_ALICE.bankCamt053,
    };
    const bankClaimSet = await mockIssuerService.createMinimalClaimSet(
      'did:pramana:issuer:bank-reg-authority',
      SYNTHETIC_ALICE.synthId,
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS],
      bankSources,
    );

    expect(bankClaimSet.claims[CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS]).toBe(480000);
    // Verifier cannot see internal IBAN or routing numbers
    expect(JSON.stringify(bankClaimSet)).not.toContain('IN00MOCK00001234567890');
    expect(JSON.stringify(bankClaimSet)).not.toContain('MOCK-BLR-01');

    // ------------------------------------------------------------------------
    // System 2: Transport Relational SQL Row
    // ------------------------------------------------------------------------
    const transportSources: SourceDataContainer = {
      transportSql: SYNTHETIC_ALICE.transportSql,
    };
    const transportClaimSet = await mockIssuerService.createMinimalClaimSet(
      'did:pramana:issuer:transport-dept',
      SYNTHETIC_ALICE.synthId,
      [CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS],
      transportSources,
    );

    expect(transportClaimSet.claims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]).toBe('ACTIVE');
    // Verifier cannot see SQL columns or vehicle registration
    expect(JSON.stringify(transportClaimSet)).not.toContain('RAW_VEHICLE_REG_NO');
    expect(JSON.stringify(transportClaimSet)).not.toContain('KA-01-AB-1234');
    expect(JSON.stringify(transportClaimSet)).not.toContain('OFF-KA-559');

    // ------------------------------------------------------------------------
    // System 3: Municipal Civil Registration REST/JSON Payload
    // ------------------------------------------------------------------------
    const civilSources: SourceDataContainer = {
      municipalRest: SYNTHETIC_ALICE.municipalRest,
    };
    const civilClaimSet = await mockIssuerService.createMinimalClaimSet(
      'did:pramana:issuer:gov-civil-dept',
      SYNTHETIC_ALICE.synthId,
      [CANONICAL_ATTRIBUTES.AGE, CANONICAL_ATTRIBUTES.CITIZENSHIP],
      civilSources,
    );

    expect(civilClaimSet.claims[CANONICAL_ATTRIBUTES.AGE]).toBeGreaterThanOrEqual(30);
    expect(civilClaimSet.claims[CANONICAL_ATTRIBUTES.CITIZENSHIP]).toBe('IND');
    // Verifier cannot see street address or ward id
    expect(JSON.stringify(civilClaimSet)).not.toContain('residential_address');
    expect(JSON.stringify(civilClaimSet)).not.toContain('123 Privacy Lane');
    expect(JSON.stringify(civilClaimSet)).not.toContain('municipal_ward_id');

    // ------------------------------------------------------------------------
    // The Verifier: Consumes uniform canonical claims without knowing the source
    // ------------------------------------------------------------------------
    const combinedClaims = {
      ...bankClaimSet.claims,
      ...transportClaimSet.claims,
      ...civilClaimSet.claims,
    };

    // Verifier evaluates its policy entirely against canonical URNs:
    const isCommercialPermitActive =
      combinedClaims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS] === 'ACTIVE';
    const isEarningsAbove300k =
      Number(combinedClaims[CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS]) >= 300000;
    const isAdult = Number(combinedClaims[CANONICAL_ATTRIBUTES.AGE]) >= 18;
    const isIndianCitizen = combinedClaims[CANONICAL_ATTRIBUTES.CITIZENSHIP] === 'IND';

    expect(isCommercialPermitActive).toBe(true);
    expect(isEarningsAbove300k).toBe(true);
    expect(isAdult).toBe(true);
    expect(isIndianCitizen).toBe(true);

    // All claims are explicitly marked mock/unsigned per Phase 3 specifications
    expect(bankClaimSet.isMockUnsigned).toBe(true);
    expect(transportClaimSet.isMockUnsigned).toBe(true);
    expect(civilClaimSet.isMockUnsigned).toBe(true);
  });

  it('demonstrates multi-source contract fulfillment for scenario variants', async () => {
    // Verifier requests commercial permit verification with earnings condition
    const contract: RequestContract = {
      id: 'req:interop:driver-eval-001',
      protocolVersion: PROTOCOL_VERSION,
      verifier: {
        did: 'did:pramana:verifier:fin-eval-01',
        name: 'Micro-Credit Assessment Ltd',
      },
      purpose: 'PURPOSE_INCOME_CHECK',
      context: 'Commercial driver credit facility verification',
      predicates: [
        {
          attributeId: CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
          operator: 'EQ',
          constant: 'ACTIVE',
        },
        {
          attributeId: CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
          operator: 'LTE',
          constant: 500000,
        },
      ],
      nonce: 'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      retention: 'TRANSIENT_SESSION_ONLY',
    };

    const requiredAttrs = mediationService.getRequiredAttributes(contract);
    expect(requiredAttrs).toEqual([
      CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
      CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
    ]);

    // Bob: Active permit, but earnings = 180,000 (Low)
    const bobSources: SourceDataContainer = {
      transportSql: SYNTHETIC_BOB.transportSql,
      bankCamt053: SYNTHETIC_BOB.bankCamt053,
    };
    const bobPermitClaims = await mockIssuerService.createMinimalClaimSet(
      'did:pramana:issuer:transport-dept',
      SYNTHETIC_BOB.synthId,
      [CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS],
      bobSources,
    );
    const bobBankClaims = await mockIssuerService.createMinimalClaimSet(
      'did:pramana:issuer:bank-reg-authority',
      SYNTHETIC_BOB.synthId,
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS],
      bobSources,
    );
    expect(bobPermitClaims.claims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]).toBe('ACTIVE');
    expect(bobBankClaims.claims[CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS]).toBe(180000);

    // Carol: Expired permit, earnings = 550,000 (High)
    const carolSources: SourceDataContainer = {
      transportSql: SYNTHETIC_CAROL.transportSql,
      bankCamt053: SYNTHETIC_CAROL.bankCamt053,
    };
    const carolPermitClaims = await mockIssuerService.createMinimalClaimSet(
      'did:pramana:issuer:transport-dept',
      SYNTHETIC_CAROL.synthId,
      [CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS],
      carolSources,
    );
    const carolBankClaims = await mockIssuerService.createMinimalClaimSet(
      'did:pramana:issuer:bank-reg-authority',
      SYNTHETIC_CAROL.synthId,
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS],
      carolSources,
    );
    expect(carolPermitClaims.claims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]).toBe('EXPIRED');
    expect(carolBankClaims.claims[CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS]).toBe(550000);

    // Dave: Active heavy permit, Mumbai MH domicile
    const daveSources: SourceDataContainer = {
      transportSql: SYNTHETIC_DAVE.transportSql,
      municipalRest: SYNTHETIC_DAVE.municipalRest,
    };
    const davePermitClaims = await mockIssuerService.createMinimalClaimSet(
      'did:pramana:issuer:transport-dept',
      SYNTHETIC_DAVE.synthId,
      [
        CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
        CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
        CANONICAL_ATTRIBUTES.DOMICILE_STATE,
      ],
      daveSources,
    );
    expect(davePermitClaims.claims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]).toBe('ACTIVE');
    expect(davePermitClaims.claims[CANONICAL_ATTRIBUTES.LICENSE_CATEGORY]).toBe('HEAVY');
    expect(davePermitClaims.claims[CANONICAL_ATTRIBUTES.DOMICILE_STATE]).toBe('MH');
  });
});
