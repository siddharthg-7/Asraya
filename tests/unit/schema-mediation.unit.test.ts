/**
 * @fileoverview Schema Mediation & Data Minimization Unit Tests
 * Pramāṇa Protocol - Phase 3 Schema Mediation
 *
 * Verifies:
 * 1. Source Data Interfaces & Synthetic Fixtures
 * 2. Source Adapters (SQL, CAMT.053, Municipal REST)
 * 3. Trust Registry Bridge & Manifest Resolution
 * 4. Canonical Attribute Output Formatting
 * 5. Mock Issuer Claim Service & Minimal Claim Sets
 * 6. Privacy & Data Minimization Invariants (Zero Source Field Leaks)
 * 7. RequestContract-driven Mediation Pipeline
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  TransportSqlAdapter,
  Camt053BankAdapter,
  MunicipalRestAdapter,
  adapterResolver,
} from '../../backend/src/adapters/index.js';
import {
  mockIssuerService,
  SourceDataContainer,
} from '../../backend/src/issuers/issuer-service.js';
import { mediationService } from '../../backend/src/services/mediation.service.js';
import {
  SYNTHETIC_ALICE,
  SYNTHETIC_BOB,
  SYNTHETIC_CAROL,
  SYNTHETIC_DAVE,
  TransportSqlPermitRow,
  Camt053StatementSource,
  MunicipalRestCitizenPayload,
} from '../../backend/src/fixtures/synthetic-data.js';
import {
  CANONICAL_ATTRIBUTES,
  ERROR_CODES,
  PramanaError,
  RequestContract,
  validateMinimalClaimSet,
  PROTOCOL_VERSION,
} from '../../shared/src/index.js';

describe('Phase 3: Schema Mediation & Data Minimization', () => {
  const sqlAdapter = new TransportSqlAdapter();
  const bankAdapter = new Camt053BankAdapter();
  const restAdapter = new MunicipalRestAdapter();

  // ==========================================================================
  // 1. SOURCE TESTS
  // ==========================================================================
  describe('1. Source Interfaces & Synthetic Fixtures', () => {
    it('provides valid synthetic transport SQL fixtures', () => {
      expect(SYNTHETIC_ALICE.transportSql.STATUS_CD).toBe('ACTV');
      expect(SYNTHETIC_ALICE.transportSql.CLASS_CD).toBe('COMM_LIGHT');
      expect(SYNTHETIC_CAROL.transportSql.STATUS_CD).toBe('EXPR');
      expect(SYNTHETIC_DAVE.transportSql.CLASS_CD).toBe('COMM_HEAVY');
    });

    it('provides valid synthetic bank CAMT.053 fixtures', () => {
      expect(SYNTHETIC_ALICE.bankCamt053.trailing12mCreditSum).toBe(480000);
      expect(SYNTHETIC_BOB.bankCamt053.trailing12mCreditSum).toBe(180000);
      expect(SYNTHETIC_ALICE.bankCamt053.currency).toBe('INR');
      expect(SYNTHETIC_ALICE.bankCamt053.accountIban).toBeDefined();
    });

    it('provides valid synthetic municipal REST fixtures', () => {
      expect(SYNTHETIC_ALICE.municipalRest.date_of_birth).toBe('1995-05-12');
      expect(SYNTHETIC_ALICE.municipalRest.state_code).toBe('KA');
      expect(SYNTHETIC_DAVE.municipalRest.state_code).toBe('MH');
      expect(SYNTHETIC_ALICE.municipalRest.residential_address).toBeDefined();
    });
  });

  // ==========================================================================
  // 2. ADAPTER TESTS
  // ==========================================================================
  describe('2. Source Adapters', () => {
    describe('TransportSqlAdapter', () => {
      it('correctly maps active light commercial permit to canonical attributes', async () => {
        const canonicalAttrs = await sqlAdapter.adapt(SYNTHETIC_ALICE.transportSql);
        expect(canonicalAttrs).toHaveLength(4);

        const statusAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
        );
        expect(statusAttr).toBeDefined();
        expect(statusAttr?.value).toBe('ACTIVE');

        const catAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
        );
        expect(catAttr?.value).toBe('COMMERCIAL');

        const distAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.DISTRICT,
        );
        expect(distAttr?.value).toBe('Bangalore Urban');

        const stateAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.DOMICILE_STATE,
        );
        expect(stateAttr?.value).toBe('KA');
      });

      it('correctly maps expired permit status', async () => {
        const canonicalAttrs = await sqlAdapter.adapt(SYNTHETIC_CAROL.transportSql);
        const statusAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
        );
        expect(statusAttr?.value).toBe('EXPIRED');
      });

      it('correctly maps heavy commercial category', async () => {
        const canonicalAttrs = await sqlAdapter.adapt(SYNTHETIC_DAVE.transportSql);
        const catAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
        );
        expect(catAttr?.value).toBe('HEAVY');
      });

      it('throws SOURCE_MISSING_FIELD if PERMIT_ID is missing', async () => {
        const malformed = {
          ...SYNTHETIC_ALICE.transportSql,
          PERMIT_ID: '',
        };
        await expect(sqlAdapter.adapt(malformed as TransportSqlPermitRow)).rejects.toMatchObject({
          code: ERROR_CODES.SOURCE_MISSING_FIELD,
        });
      });

      it('throws SOURCE_INVALID if STATUS_CD is invalid', async () => {
        const malformed = {
          ...SYNTHETIC_ALICE.transportSql,
          STATUS_CD: 'INVALID_STATUS',
        };
        await expect(
          sqlAdapter.adapt(malformed as unknown as TransportSqlPermitRow),
        ).rejects.toMatchObject({
          code: ERROR_CODES.SOURCE_INVALID,
        });
      });

      it('provides adaptToClaims dictionary output', async () => {
        const claims = await sqlAdapter.adaptToClaims(SYNTHETIC_ALICE.transportSql);
        expect(claims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]).toBe('ACTIVE');
        expect(claims[CANONICAL_ATTRIBUTES.LICENSE_CATEGORY]).toBe('COMMERCIAL');
      });
    });

    describe('Camt053BankAdapter', () => {
      it('correctly transforms credit balance and trailing 12m earnings', async () => {
        const canonicalAttrs = await bankAdapter.adapt(SYNTHETIC_ALICE.bankCamt053);
        expect(canonicalAttrs).toHaveLength(3);

        const earningsAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
        );
        expect(earningsAttr?.value).toBe(480000);

        const balAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE,
        );
        expect(balAttr?.value).toBe(154200.5);

        const ccyAttr = canonicalAttrs.find((a) => a.attributeId === CANONICAL_ATTRIBUTES.CURRENCY);
        expect(ccyAttr?.value).toBe('INR');
      });

      it('correctly handles debit balance as negative net balance', async () => {
        const debitStmt: Camt053StatementSource = {
          ...SYNTHETIC_BOB.bankCamt053,
          creditDebitIndicator: 'DBIT',
          closingBalanceAmount: 25000,
        };
        const canonicalAttrs = await bankAdapter.adapt(debitStmt);
        const balAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE,
        );
        expect(balAttr?.value).toBe(-25000);
      });

      it('correctly parses raw ISO 20022 XML string input', async () => {
        const xml = `
          <Document>
            <BkToCstmrStmt>
              <Stmt>
                <Id>XML-STMT-999</Id>
                <Acct><Id><IBAN>IN00MOCK999999</IBAN></Id></Acct>
                <Bal>
                  <Amt Ccy="INR">60000.00</Amt>
                  <CdtDbtInd>CRDT</CdtDbtInd>
                </Bal>
              </Stmt>
            </BkToCstmrStmt>
          </Document>
        `;
        const canonicalAttrs = await bankAdapter.adapt(xml);
        const balAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE,
        );
        expect(balAttr?.value).toBe(60000);
      });

      it('throws SOURCE_MISSING_FIELD on missing numeric closingBalanceAmount', async () => {
        const malformed = {
          ...SYNTHETIC_ALICE.bankCamt053,
          closingBalanceAmount: undefined,
        };
        await expect(
          bankAdapter.adapt(malformed as unknown as Camt053StatementSource),
        ).rejects.toMatchObject({
          code: ERROR_CODES.SOURCE_MISSING_FIELD,
        });
      });

      it('throws SOURCE_INVALID on negative credit amounts', async () => {
        const malformed = {
          ...SYNTHETIC_ALICE.bankCamt053,
          trailing12mCreditSum: -100,
        };
        await expect(bankAdapter.adapt(malformed)).rejects.toMatchObject({
          code: ERROR_CODES.SOURCE_INVALID,
        });
      });

      it('throws SOURCE_INVALID on malformed XML string', async () => {
        const malformedXml = '<Document><BrokenTag></BrokenTag></Document>';
        await expect(bankAdapter.adapt(malformedXml)).rejects.toMatchObject({
          code: ERROR_CODES.SOURCE_INVALID,
        });
      });
    });

    describe('MunicipalRestAdapter', () => {
      it('correctly derives age and maps civil identity attributes', async () => {
        const canonicalAttrs = await restAdapter.adapt(SYNTHETIC_ALICE.municipalRest);
        expect(canonicalAttrs).toHaveLength(5);

        const ageAttr = canonicalAttrs.find((a) => a.attributeId === CANONICAL_ATTRIBUTES.AGE);
        expect(typeof ageAttr?.value).toBe('number');
        expect(Number(ageAttr?.value)).toBeGreaterThanOrEqual(30);

        const dobAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.BIRTHDATE,
        );
        expect(dobAttr?.value).toBe('1995-05-12');

        const stateAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.DOMICILE_STATE,
        );
        expect(stateAttr?.value).toBe('KA');

        const citAttr = canonicalAttrs.find(
          (a) => a.attributeId === CANONICAL_ATTRIBUTES.CITIZENSHIP,
        );
        expect(citAttr?.value).toBe('IND');
      });

      it('throws SOURCE_MISSING_FIELD if registration_id is missing', async () => {
        const malformed = {
          ...SYNTHETIC_ALICE.municipalRest,
          registration_id: '',
        };
        await expect(
          restAdapter.adapt(malformed as MunicipalRestCitizenPayload),
        ).rejects.toMatchObject({
          code: ERROR_CODES.SOURCE_MISSING_FIELD,
        });
      });

      it('throws SOURCE_INVALID if date_of_birth format is not YYYY-MM-DD', async () => {
        const malformed = {
          ...SYNTHETIC_ALICE.municipalRest,
          date_of_birth: '12/05/1995', // Invalid format
        };
        await expect(
          restAdapter.adapt(malformed as MunicipalRestCitizenPayload),
        ).rejects.toMatchObject({
          code: ERROR_CODES.SOURCE_INVALID,
        });
      });
    });
  });

  // ==========================================================================
  // 3. REGISTRY RESOLUTION TESTS
  // ==========================================================================
  describe('3. Adapter & Bridge Registry Resolution', () => {
    it('resolves adapter and bridge for permit status attribute', async () => {
      const resolution = await adapterResolver.resolveForAttribute(
        CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
      );
      expect(resolution.adapter.adapterId).toBe('adapter:transport:rto-sql');
      expect(resolution.bridgeId).toBe('bridge:rto:sql-to-permit');
      expect(resolution.manifestId).toBe('adapter:transport:rto-sql');
    });

    it('resolves adapter and bridge for trailing earnings attribute', async () => {
      const resolution = await adapterResolver.resolveForAttribute(
        CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
      );
      expect(resolution.adapter.adapterId).toBe('adapter:banking:iso20022-camt053');
      expect(resolution.bridgeId).toBe('bridge:bank:camt053-to-trailing12m');
    });

    it('resolves adapter and bridge for civil age attribute', async () => {
      const resolution = await adapterResolver.resolveForAttribute(CANONICAL_ATTRIBUTES.AGE);
      expect(resolution.adapter.adapterId).toBe('adapter:civil:rest-json');
      expect(resolution.bridgeId).toBe('bridge:civil:sql-to-age');
    });

    it('rejects unsupported canonical attributes with ATTRIBUTE_NOT_SUPPORTED', async () => {
      await expect(
        adapterResolver.resolveForAttribute('urn:pramana:attr:bogus:unknown'),
      ).rejects.toMatchObject({
        code: ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED,
      });
    });

    it('adapts a single canonical attribute through dynamic resolution', async () => {
      const attr = await adapterResolver.adaptAttribute(
        CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
        SYNTHETIC_ALICE.bankCamt053,
      );
      expect(attr.attributeId).toBe(CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS);
      expect(attr.value).toBe(480000);
      expect(attr.sourceAdapterId).toBe('adapter:banking:iso20022-camt053');
      expect(attr.bridgeId).toBe('bridge:bank:camt053-to-trailing12m');
    });
  });

  // ==========================================================================
  // 4. MOCK ISSUER SERVICE TESTS
  // ==========================================================================
  describe('4. Mock Issuer Claim Service & Minimal Claim Sets', () => {
    const sources: SourceDataContainer = {
      transportSql: SYNTHETIC_ALICE.transportSql,
      bankCamt053: SYNTHETIC_ALICE.bankCamt053,
      municipalRest: SYNTHETIC_ALICE.municipalRest,
    };

    it('generates a strictly minimal claim set for authorized issuer', async () => {
      const issuerDid = 'did:pramana:issuer:transport-dept';
      const requestedAttrs = [
        CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
        CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
      ];

      const claimSet = await mockIssuerService.createMinimalClaimSet(
        issuerDid,
        SYNTHETIC_ALICE.synthId,
        requestedAttrs,
        sources,
      );

      // Validate schema conformance
      const validated = validateMinimalClaimSet(claimSet);
      expect(validated.issuerDid).toBe(issuerDid);
      expect(validated.subjectId).toBe(SYNTHETIC_ALICE.synthId);
      expect(validated.isMockUnsigned).toBe(true);

      // Verify only requested attributes are present in claims
      expect(Object.keys(validated.claims)).toHaveLength(2);
      expect(validated.claims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]).toBe('ACTIVE');
      expect(validated.claims[CANONICAL_ATTRIBUTES.LICENSE_CATEGORY]).toBe('COMMERCIAL');
    });

    it('generates financial claims from bank CAMT.053 source', async () => {
      const issuerDid = 'did:pramana:issuer:bank-reg-authority';
      const requestedAttrs = [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS];

      const claimSet = await mockIssuerService.createMinimalClaimSet(
        issuerDid,
        SYNTHETIC_ALICE.synthId,
        requestedAttrs,
        sources,
      );

      expect(claimSet.claims[CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS]).toBe(480000);
      expect(claimSet.isMockUnsigned).toBe(true);
    });

    it('rejects unknown issuer DID with ISSUER_NOT_FOUND', async () => {
      await expect(
        mockIssuerService.createMinimalClaimSet(
          'did:pramana:issuer:nonexistent-org',
          SYNTHETIC_ALICE.synthId,
          [CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS],
          sources,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODES.ISSUER_NOT_FOUND,
      });
    });

    it('rejects claim generation if required source is missing', async () => {
      const issuerDid = 'did:pramana:issuer:transport-dept';
      const emptySources: SourceDataContainer = {};

      await expect(
        mockIssuerService.createMinimalClaimSet(
          issuerDid,
          SYNTHETIC_ALICE.synthId,
          [CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS],
          emptySources,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODES.SOURCE_MISSING_FIELD,
      });
    });

    it('rejects empty requested attributes array', async () => {
      const issuerDid = 'did:pramana:issuer:transport-dept';
      await expect(
        mockIssuerService.createMinimalClaimSet(issuerDid, SYNTHETIC_ALICE.synthId, [], sources),
      ).rejects.toMatchObject({
        code: ERROR_CODES.CLAIM_GENERATION_FAILED,
      });
    });
  });

  // ==========================================================================
  // 5. PRIVACY & DATA MINIMIZATION INVARIANT TESTS
  // ==========================================================================
  describe('5. Privacy & Data Minimization Invariants', () => {
    it('verifies verifier never receives raw SQL column names or sensitive transport data', async () => {
      const issuerDid = 'did:pramana:issuer:transport-dept';
      const requestedAttrs = [CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS];
      const sources: SourceDataContainer = {
        transportSql: SYNTHETIC_ALICE.transportSql,
      };

      const claimSet = await mockIssuerService.createMinimalClaimSet(
        issuerDid,
        SYNTHETIC_ALICE.synthId,
        requestedAttrs,
        sources,
      );

      const claimsKeys = Object.keys(claimSet.claims);
      const claimsStr = JSON.stringify(claimSet.claims);

      // Must only contain canonical attribute URN
      expect(claimsKeys).toEqual([CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]);

      // Strictly must NOT leak raw SQL column names
      expect(claimsStr).not.toContain('STATUS_CD');
      expect(claimsStr).not.toContain('PERMIT_ID');
      expect(claimsStr).not.toContain('RAW_VEHICLE_REG_NO');
      expect(claimsStr).not.toContain('INSPECTION_OFFICER_ID');
      expect(claimsStr).not.toContain('CLASS_CD');
      expect(claimsStr).not.toContain('KA-01-AB-1234'); // Vehicle registration
    });

    it('verifies verifier never receives raw bank statement, IBAN, or transaction history', async () => {
      const issuerDid = 'did:pramana:issuer:bank-reg-authority';
      const requestedAttrs = [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS];
      const sources: SourceDataContainer = {
        bankCamt053: SYNTHETIC_ALICE.bankCamt053,
      };

      const claimSet = await mockIssuerService.createMinimalClaimSet(
        issuerDid,
        SYNTHETIC_ALICE.synthId,
        requestedAttrs,
        sources,
      );

      const claimsKeys = Object.keys(claimSet.claims);
      const claimsStr = JSON.stringify(claimSet.claims);

      expect(claimsKeys).toEqual([CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS]);

      // Strictly must NOT leak banking secrets
      expect(claimsStr).not.toContain('accountIban');
      expect(claimsStr).not.toContain('IN00MOCK00001234567890'); // IBAN
      expect(claimsStr).not.toContain('branchRoutingCode');
      expect(claimsStr).not.toContain('rawTransactionsCount');
      expect(claimsStr).not.toContain('closingBalanceAmount');
    });

    it('verifies verifier never receives municipal ward or residential address', async () => {
      const issuerDid = 'did:pramana:issuer:gov-civil-dept';
      const requestedAttrs = [CANONICAL_ATTRIBUTES.AGE];
      const sources: SourceDataContainer = {
        municipalRest: SYNTHETIC_ALICE.municipalRest,
      };

      const claimSet = await mockIssuerService.createMinimalClaimSet(
        issuerDid,
        SYNTHETIC_ALICE.synthId,
        requestedAttrs,
        sources,
      );

      const claimsKeys = Object.keys(claimSet.claims);
      const claimsStr = JSON.stringify(claimSet.claims);

      expect(claimsKeys).toEqual([CANONICAL_ATTRIBUTES.AGE]);

      // Strictly must NOT leak civil sensitive data
      expect(claimsStr).not.toContain('residential_address');
      expect(claimsStr).not.toContain('123 Privacy Lane');
      expect(claimsStr).not.toContain('municipal_ward_id');
      expect(claimsStr).not.toContain('registration_id');
    });
  });

  // ==========================================================================
  // 6. REQUEST CONTRACT TO MEDIATED MINIMAL CLAIM SET (INTEGRATION)
  // ==========================================================================
  describe('6. RequestContract Integration Pipeline', () => {
    it('mediates heterogeneous sources driven by a verified RequestContract', async () => {
      // Build a realistic request contract asking for permit status, earnings >= 300k, and district
      const contract: RequestContract = {
        id: 'req:test:phase3:001',
        protocolVersion: PROTOCOL_VERSION,
        verifier: {
          did: 'did:pramana:verifier:permit-portal-01',
          name: 'Municipal Commerce Licensing Board',
        },
        purpose: 'PURPOSE_COMMERCIAL_PERMIT',
        context: 'Urban commercial transport license verification',
        predicates: [
          {
            attributeId: CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
            operator: 'EQ',
            constant: 'ACTIVE',
          },
          {
            attributeId: CANONICAL_ATTRIBUTES.DISTRICT,
            operator: 'EQ',
            constant: 'Bangalore Urban',
          },
        ],
        nonce: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
      };

      const sources: SourceDataContainer = {
        transportSql: SYNTHETIC_ALICE.transportSql,
        bankCamt053: SYNTHETIC_ALICE.bankCamt053,
        municipalRest: SYNTHETIC_ALICE.municipalRest,
      };

      // Extract required attributes
      const reqAttrs = mediationService.getRequiredAttributes(contract);
      expect(reqAttrs).toContain(CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS);
      expect(reqAttrs).toContain(CANONICAL_ATTRIBUTES.DISTRICT);
      expect(reqAttrs).toHaveLength(2);

      // Mediate to minimal claim set
      const claimSet = await mediationService.mediateForRequest(
        contract,
        'did:pramana:issuer:transport-dept',
        SYNTHETIC_ALICE.synthId,
        sources,
      );

      expect(claimSet.claims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]).toBe('ACTIVE');
      expect(claimSet.claims[CANONICAL_ATTRIBUTES.DISTRICT]).toBe('Bangalore Urban');
      expect(claimSet.isMockUnsigned).toBe(true);
      expect(Object.keys(claimSet.claims)).toHaveLength(2);
    });

    it('mediates compound predicate request contracts', async () => {
      const contract: RequestContract = {
        id: 'req:test:phase3:002',
        protocolVersion: PROTOCOL_VERSION,
        verifier: {
          did: 'did:pramana:verifier:permit-portal-01',
          name: 'Municipal Commerce Licensing Board',
        },
        purpose: 'PURPOSE_COMMERCIAL_PERMIT',
        context: 'Compound predicate verification',
        predicates: [
          {
            type: 'COMPOUND_AND',
            predicates: [
              {
                attributeId: CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
                operator: 'EQ',
                constant: 'ACTIVE',
              },
              {
                attributeId: CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
                operator: 'EQ',
                constant: 'COMMERCIAL',
              },
            ],
          },
        ],
        nonce: 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        retention: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
      };

      const sources: SourceDataContainer = {
        transportSql: SYNTHETIC_ALICE.transportSql,
      };

      const claimSet = await mediationService.mediateForRequest(
        contract,
        'did:pramana:issuer:transport-dept',
        SYNTHETIC_ALICE.synthId,
        sources,
      );

      expect(claimSet.claims[CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]).toBe('ACTIVE');
      expect(claimSet.claims[CANONICAL_ATTRIBUTES.LICENSE_CATEGORY]).toBe('COMMERCIAL');
      expect(Object.keys(claimSet.claims)).toHaveLength(2);
    });
  });
});
