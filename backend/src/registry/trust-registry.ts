/**
 * @fileoverview Trust Registry Service & Resolution Interface
 * Pramāṇa Protocol - Phase 2 Trust Registry & Institution Trust Layer
 *
 * Notice: Strictly maintains institutional trust anchors, schemas, bridges,
 * adapter manifests, and consent templates.
 * NEVER stores citizen data.
 */

import {
  IssuerKey,
  VerifierLicence,
  AttributeDefinition,
  AttributeCategory,
  BridgeDefinition,
  AdapterManifest,
  TemplateBundle,
  TrustCheckpoint,
  CANONICAL_ATTRIBUTES,
  validateIssuerKey,
  validateVerifierLicence,
  validateAttributeDef,
  validateBridge,
  validateAdapterManifest,
  validateTemplateBundle,
  validateTrustCheckpoint,
  PramanaError,
  ERROR_CODES,
} from '@pramana/shared';

export interface ITrustRegistry {
  getIssuer(didOrId: string): Promise<IssuerKey | null>;
  getVerifierLicence(didOrId: string): Promise<VerifierLicence | null>;
  getAttributeDefinition(idOrAlias: string): Promise<AttributeDefinition | null>;
  listAttributes(category?: AttributeCategory): Promise<AttributeDefinition[]>;
  getBridge(bridgeId: string): Promise<BridgeDefinition | null>;
  getBridgesForAttribute(canonicalAttributeId: string): Promise<BridgeDefinition[]>;
  getAdapter(adapterId: string): Promise<AdapterManifest | null>;
  getAdaptersForAttribute(canonicalAttributeId: string): Promise<AdapterManifest[]>;
  getTemplate(purposeCode: string, locale?: string): Promise<TemplateBundle | null>;
  getLatestCheckpoint(): Promise<TrustCheckpoint>;
  registerIssuer(record: IssuerKey): Promise<void>;
  registerVerifierLicence(licence: VerifierLicence): Promise<void>;
  registerAttributeDefinition(def: AttributeDefinition): Promise<void>;
  registerBridge(bridge: BridgeDefinition): Promise<void>;
  registerAdapter(manifest: AdapterManifest): Promise<void>;
  registerTemplate(template: TemplateBundle): Promise<void>;
}

export interface ITrustCheckpointVerifier {
  verifyCheckpoint(checkpoint: TrustCheckpoint): Promise<boolean>;
}

/**
 * Trust Checkpoint Verifier
 * Cryptographic signature verification is strictly separated and marked NOT IMPLEMENTED
 * in compliance with Rule 5 & 6 of AGENTS.md until Phase 5.
 */
export class TrustCheckpointVerifier implements ITrustCheckpointVerifier {
  async verifyCheckpoint(checkpoint: TrustCheckpoint): Promise<boolean> {
    validateTrustCheckpoint(checkpoint);
    throw new PramanaError(
      ERROR_CODES.NOT_IMPLEMENTED,
      'NOT IMPLEMENTED — Checkpoint cryptographic signature verification is deferred to Phase 5',
    );
  }
}

export class InMemoryTrustRegistry implements ITrustRegistry {
  private readonly issuers = new Map<string, IssuerKey>();
  private readonly verifiers = new Map<string, VerifierLicence>();
  private readonly attributes = new Map<string, AttributeDefinition>();
  private readonly bridges = new Map<string, BridgeDefinition>();
  private readonly adapters = new Map<string, AdapterManifest>();
  private readonly templates = new Map<string, TemplateBundle>();

  constructor() {
    this.seedDefaultRegistryData();
  }

  private seedDefaultRegistryData(): void {
    // ------------------------------------------------------------------------
    // 1. Seed Issuers (Tier 1 Trust Anchors)
    // ------------------------------------------------------------------------
    this.issuers.set('did:pramana:issuer:gov-civil-dept', {
      did: 'did:pramana:issuer:gov-civil-dept',
      issuerId: 'gov-civil-dept',
      legalName: 'Civil Registration Department',
      authorizedSchemas: ['urn:pramana:schema:civil:identity:v1'],
      publicKeys: {
        bbsG2PublicKey: 'bls12381_g2_mock_public_key_anchor_civil_01',
        revocationEndpoint: 'https://registry.pramana.gov.in/revocation/civil-v1',
      },
      validUntil: '2035-12-31T23:59:59Z',
      status: 'ACTIVE',
      active: true,
    });

    this.issuers.set('did:pramana:issuer:bank-reg-authority', {
      did: 'did:pramana:issuer:bank-reg-authority',
      issuerId: 'bank-reg-authority',
      legalName: 'Banking Regulatory Authority',
      authorizedSchemas: ['urn:pramana:schema:fin:earnings:v1'],
      publicKeys: {
        bbsG2PublicKey: 'bls12381_g2_mock_public_key_anchor_bank_01',
      },
      validUntil: '2035-12-31T23:59:59Z',
      status: 'ACTIVE',
      active: true,
    });

    this.issuers.set('did:pramana:issuer:transport-dept', {
      did: 'did:pramana:issuer:transport-dept',
      issuerId: 'transport-dept',
      legalName: 'State Transport Department',
      authorizedSchemas: ['urn:pramana:schema:trans:permit:v1'],
      publicKeys: {
        bbsG2PublicKey: 'bls12381_g2_mock_public_key_anchor_transport_01',
      },
      validUntil: '2035-12-31T23:59:59Z',
      status: 'ACTIVE',
      active: true,
    });

    // ------------------------------------------------------------------------
    // 2. Seed Verifier Licences
    // ------------------------------------------------------------------------
    const venueLicence: VerifierLicence = {
      did: 'did:pramana:verifier:venue-access-01',
      verifierId: 'venue-access-01',
      legalName: 'Venue Access Control Ltd',
      permittedPurposes: ['PURPOSE_AGE_VERIFICATION'],
      permittedPredicates: ['urn:pramana:attr:civil:age'],
      permittedAttributes: ['urn:pramana:attr:civil:age'],
      maxRetentionPolicy: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
      validUntil: '2030-01-01T00:00:00Z',
      status: 'ACTIVE',
      issuedAt: '2025-01-01T00:00:00Z',
    };
    this.verifiers.set('did:pramana:verifier:venue-access-01', venueLicence);
    this.verifiers.set('did:pramana:verifier:venue-01', venueLicence); // test alias

    const fintechLicence: VerifierLicence = {
      did: 'did:pramana:verifier:fin-eval-01',
      verifierId: 'fin-eval-01',
      legalName: 'Micro-Credit Assessment Ltd',
      permittedPurposes: ['PURPOSE_INCOME_CHECK', 'PURPOSE_AGE_VERIFICATION'],
      permittedPredicates: [
        'urn:pramana:attr:fin:annual_income',
        'urn:pramana:attr:fin:trailing_12m_earnings',
        'urn:pramana:attr:fin:credit_score',
        'urn:pramana:attr:civil:age',
      ],
      permittedAttributes: [
        'urn:pramana:attr:fin:annual_income',
        'urn:pramana:attr:fin:trailing_12m_earnings',
        'urn:pramana:attr:civil:age',
      ],
      maxRetentionPolicy: 'TRANSIENT_SESSION_ONLY',
      validUntil: '2030-12-31T23:59:59Z',
      status: 'ACTIVE',
      issuedAt: '2025-01-01T00:00:00Z',
    };
    this.verifiers.set('did:pramana:verifier:fin-eval-01', fintechLicence);
    this.verifiers.set('did:pramana:verifier:fintech-01', fintechLicence); // test alias

    const permitLicence: VerifierLicence = {
      did: 'did:pramana:verifier:permit-portal-01',
      verifierId: 'permit-portal-01',
      legalName: 'Municipal Commerce Licensing Board',
      permittedPurposes: ['PURPOSE_COMMERCIAL_PERMIT'],
      permittedPredicates: [
        'urn:pramana:attr:permit:status',
        'urn:pramana:attr:trans:license_category',
        'urn:pramana:attr:civil:domicile_state',
      ],
      permittedAttributes: [
        'urn:pramana:attr:permit:status',
        'urn:pramana:attr:trans:license_category',
      ],
      maxRetentionPolicy: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
      validUntil: '2030-12-31T23:59:59Z',
      status: 'ACTIVE',
      issuedAt: '2025-01-01T00:00:00Z',
    };
    this.verifiers.set('did:pramana:verifier:permit-portal-01', permitLicence);

    const subsidyLicence: VerifierLicence = {
      did: 'did:pramana:verifier:fuel-subsidy-01',
      verifierId: 'fuel-subsidy-01',
      legalName: 'Municipal Fuel Subsidy Authority',
      permittedPurposes: ['fuel_subsidy_eligibility', 'PURPOSE_FUEL_SUBSIDY'],
      permittedPredicates: [
        'urn:pramana:attr:permit:status',
        'commercial_permit_status',
        'urn:pramana:attr:fin:trailing_12m_earnings',
        'trailing_12m_earnings',
        'urn:pramana:attr:civil:district',
        'district',
      ],
      permittedAttributes: [
        'urn:pramana:attr:permit:status',
        'commercial_permit_status',
        'urn:pramana:attr:fin:trailing_12m_earnings',
        'trailing_12m_earnings',
        'urn:pramana:attr:civil:district',
        'district',
      ],
      maxRetentionPolicy: 'AUDIT_RECEIPT_ONLY_ZERO_PII',
      validUntil: '2030-12-31T23:59:59Z',
      status: 'ACTIVE',
      issuedAt: '2025-01-01T00:00:00Z',
    };
    this.verifiers.set('did:pramana:verifier:fuel-subsidy-01', subsidyLicence);
    this.verifiers.set('fuel-subsidy-01', subsidyLicence);
    this.verifiers.set('did:pramana:verifier:subsidy-dept-01', subsidyLicence);

    // Negative test licences: Expired, Suspended, Revoked
    this.verifiers.set('did:pramana:verifier:expired-01', {
      did: 'did:pramana:verifier:expired-01',
      verifierId: 'expired-01',
      legalName: 'Expired Merchant Corp',
      permittedPurposes: ['PURPOSE_AGE_VERIFICATION'],
      permittedPredicates: ['urn:pramana:attr:civil:age'],
      maxRetentionPolicy: 'NO_RETENTION_VERIFY_ONLY',
      validUntil: '2020-01-01T00:00:00Z', // Expired
      status: 'ACTIVE',
    });

    this.verifiers.set('did:pramana:verifier:suspended-01', {
      did: 'did:pramana:verifier:suspended-01',
      verifierId: 'suspended-01',
      legalName: 'Suspended Gaming Portal Ltd',
      permittedPurposes: ['PURPOSE_AGE_VERIFICATION'],
      permittedPredicates: ['urn:pramana:attr:civil:age'],
      maxRetentionPolicy: 'NO_RETENTION_VERIFY_ONLY',
      validUntil: '2030-01-01T00:00:00Z',
      status: 'SUSPENDED',
    });

    this.verifiers.set('did:pramana:verifier:revoked-01', {
      did: 'did:pramana:verifier:revoked-01',
      verifierId: 'revoked-01',
      legalName: 'Fraudulent Verifier Corp',
      permittedPurposes: ['PURPOSE_AGE_VERIFICATION'],
      permittedPredicates: ['urn:pramana:attr:civil:age'],
      maxRetentionPolicy: 'NO_RETENTION_VERIFY_ONLY',
      validUntil: '2030-01-01T00:00:00Z',
      status: 'REVOKED',
    });

    // ------------------------------------------------------------------------
    // 3. Seed Canonical Attribute Definitions
    // ------------------------------------------------------------------------
    const attrDefs: AttributeDefinition[] = [
      {
        id: CANONICAL_ATTRIBUTES.AGE,
        name: 'age',
        category: 'civil',
        dataType: 'number',
        description: 'Citizen completed age in solar years',
        schemaId: 'urn:pramana:schema:civil:identity:v1',
        unit: 'years',
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.BIRTHDATE,
        name: 'birthdate',
        category: 'civil',
        dataType: 'date',
        description: 'Citizen official date of birth in ISO 8601 (YYYY-MM-DD)',
        schemaId: 'urn:pramana:schema:civil:identity:v1',
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.DOMICILE_STATE,
        name: 'domicile_state',
        category: 'civil',
        dataType: 'string',
        description: 'Citizen official state or provincial administrative code',
        schemaId: 'urn:pramana:schema:civil:identity:v1',
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.DISTRICT,
        name: 'district',
        category: 'civil',
        dataType: 'string',
        description: 'Citizen domicile district or regional division',
        schemaId: 'urn:pramana:schema:civil:identity:v1',
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.CITIZENSHIP,
        name: 'citizenship',
        category: 'civil',
        dataType: 'string',
        description: 'ISO 3166-1 alpha-3 sovereign nationality code',
        schemaId: 'urn:pramana:schema:civil:identity:v1',
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.ANNUAL_INCOME,
        name: 'annual_income',
        category: 'financial',
        dataType: 'number',
        description: 'Official verified annual gross income',
        schemaId: 'urn:pramana:schema:fin:earnings:v1',
        unit: 'INR',
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
        name: 'trailing_12m_earnings',
        category: 'financial',
        dataType: 'number',
        description:
          'Verified aggregate trailing twelve months net business or employment earnings',
        schemaId: 'urn:pramana:schema:fin:earnings:v1',
        unit: 'INR',
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE,
        name: 'account_balance',
        category: 'financial',
        dataType: 'number',
        description: 'Audited closing balance across linked banking institutions',
        schemaId: 'urn:pramana:schema:fin:earnings:v1',
        unit: 'INR',
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.CREDIT_SCORE,
        name: 'credit_score',
        category: 'financial',
        dataType: 'number',
        description: 'Regulatory credit bureau risk assessment score',
        schemaId: 'urn:pramana:schema:fin:earnings:v1',
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
        name: 'commercial_permit_status',
        category: 'transport',
        dataType: 'string',
        description: 'Commercial operating license authorization status',
        schemaId: 'urn:pramana:schema:trans:permit:v1',
        allowedValues: ['ACTIVE', 'VALID', 'EXPIRED', 'PENDING'],
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
        name: 'license_category',
        category: 'transport',
        dataType: 'string',
        description: 'Vehicular or transport operating licence category',
        schemaId: 'urn:pramana:schema:trans:permit:v1',
        allowedValues: ['COMMERCIAL', 'PRIVATE', 'HEAVY'],
        version: '1.0.0',
      },
      {
        id: CANONICAL_ATTRIBUTES.LICENSE_VALIDITY,
        name: 'validity_date',
        category: 'transport',
        dataType: 'date',
        description: 'Permit expiration cutoff timestamp',
        schemaId: 'urn:pramana:schema:trans:permit:v1',
        version: '1.0.0',
      },
    ];

    for (const def of attrDefs) {
      this.attributes.set(def.id, def);
      this.attributes.set(def.name, def); // Also index by name for alias lookups
    }

    // ------------------------------------------------------------------------
    // 4. Seed Bridges (Mapping metadata - NEVER contains citizen records)
    // ------------------------------------------------------------------------
    const bankingBridge: BridgeDefinition = {
      bridgeId: 'bridge:bank:camt053-to-trailing12m',
      name: 'Banking CAMT.053 Statement to Trailing Earnings',
      sourceSystem: 'CORE_BANKING_ISO20022',
      sourceField: 'BkToCstmrStmt.Stmt.Bal.Amt',
      canonicalAttributeId: CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
      transformRule: 'AGGREGATE_SUM_CREDITS_365D',
      version: '1.0.0',
    };
    this.bridges.set(bankingBridge.bridgeId, bankingBridge);

    const bankBalBridge: BridgeDefinition = {
      bridgeId: 'bridge:bank:camt053-to-balance',
      name: 'Banking CAMT.053 Statement to Account Balance',
      sourceSystem: 'CORE_BANKING_ISO20022',
      sourceField: 'BkToCstmrStmt.Stmt.Bal.Amt',
      canonicalAttributeId: CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE,
      transformRule: 'NET_BALANCE_INDICATOR',
      version: '1.0.0',
    };
    this.bridges.set(bankBalBridge.bridgeId, bankBalBridge);

    const bankCcyBridge: BridgeDefinition = {
      bridgeId: 'bridge:bank:camt053-to-currency',
      name: 'Banking CAMT.053 Statement to Currency',
      sourceSystem: 'CORE_BANKING_ISO20022',
      sourceField: 'BkToCstmrStmt.Stmt.Bal.Amt.@Ccy',
      canonicalAttributeId: CANONICAL_ATTRIBUTES.CURRENCY,
      transformRule: 'UPPERCASE_CODE',
      version: '1.0.0',
    };
    this.bridges.set(bankCcyBridge.bridgeId, bankCcyBridge);

    const civilBridge: BridgeDefinition = {
      bridgeId: 'bridge:civil:sql-to-age',
      name: 'Civil Registration SQL to Age',
      sourceSystem: 'CIVIL_DATABASE_SQL',
      sourceField: 'citizens.records.date_of_birth',
      canonicalAttributeId: CANONICAL_ATTRIBUTES.AGE,
      transformRule: 'COMPUTE_AGE_FROM_DATE',
      version: '1.0.0',
    };
    this.bridges.set(civilBridge.bridgeId, civilBridge);

    const civilDobBridge: BridgeDefinition = {
      bridgeId: 'bridge:civil:sql-to-birthdate',
      name: 'Civil Registration SQL to Birthdate',
      sourceSystem: 'CIVIL_DATABASE_SQL',
      sourceField: 'citizens.records.date_of_birth',
      canonicalAttributeId: CANONICAL_ATTRIBUTES.BIRTHDATE,
      transformRule: 'DIRECT_MAPPING',
      version: '1.0.0',
    };
    this.bridges.set(civilDobBridge.bridgeId, civilDobBridge);

    const civilDistrictBridge: BridgeDefinition = {
      bridgeId: 'bridge:civil:sql-to-district',
      name: 'Civil Registration SQL to District',
      sourceSystem: 'CIVIL_DATABASE_SQL',
      sourceField: 'citizens.records.district_name',
      canonicalAttributeId: CANONICAL_ATTRIBUTES.DISTRICT,
      transformRule: 'DIRECT_MAPPING',
      version: '1.0.0',
    };
    this.bridges.set(civilDistrictBridge.bridgeId, civilDistrictBridge);

    const civilDomicileBridge: BridgeDefinition = {
      bridgeId: 'bridge:civil:sql-to-domicile',
      name: 'Civil Registration SQL to Domicile State',
      sourceSystem: 'CIVIL_DATABASE_SQL',
      sourceField: 'citizens.records.state_code',
      canonicalAttributeId: CANONICAL_ATTRIBUTES.DOMICILE_STATE,
      transformRule: 'DIRECT_MAPPING',
      version: '1.0.0',
    };
    this.bridges.set(civilDomicileBridge.bridgeId, civilDomicileBridge);

    const civilCitizenshipBridge: BridgeDefinition = {
      bridgeId: 'bridge:civil:sql-to-citizenship',
      name: 'Civil Registration SQL to Citizenship',
      sourceSystem: 'CIVIL_DATABASE_SQL',
      sourceField: 'citizens.records.nationality_code',
      canonicalAttributeId: CANONICAL_ATTRIBUTES.CITIZENSHIP,
      transformRule: 'DIRECT_MAPPING',
      version: '1.0.0',
    };
    this.bridges.set(civilCitizenshipBridge.bridgeId, civilCitizenshipBridge);

    const rtoBridge: BridgeDefinition = {
      bridgeId: 'bridge:rto:sql-to-permit',
      name: 'State Transport RTO Database to Permit Status',
      sourceSystem: 'RTO_PERMITS_SQL',
      sourceField: 'transport_permits.status',
      canonicalAttributeId: CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
      transformRule: 'MAP_PERMIT_ENUM',
      version: '1.0.0',
    };
    this.bridges.set(rtoBridge.bridgeId, rtoBridge);

    const rtoCategoryBridge: BridgeDefinition = {
      bridgeId: 'bridge:rto:sql-to-license-category',
      name: 'State Transport RTO Database to License Category',
      sourceSystem: 'RTO_PERMITS_SQL',
      sourceField: 'transport_permits.class_cd',
      canonicalAttributeId: CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
      transformRule: 'MAP_LICENSE_CATEGORY',
      version: '1.0.0',
    };
    this.bridges.set(rtoCategoryBridge.bridgeId, rtoCategoryBridge);

    // ------------------------------------------------------------------------
    // 5. Seed Adapter Manifests (Metadata describing translation adapters)
    // ------------------------------------------------------------------------
    const bankAdapter: AdapterManifest = {
      adapterId: 'adapter:banking:iso20022-camt053',
      name: 'ISO 20022 CAMT.053 Banking XML Adapter',
      sourceFormat: 'ISO20022_CAMT053',
      targetSchemaId: 'urn:pramana:schema:fin:earnings:v1',
      version: '1.0.0',
      supportedAttributes: [
        CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS,
        CANONICAL_ATTRIBUTES.ACCOUNT_BALANCE,
      ],
      status: 'ACTIVE',
    };
    this.adapters.set(bankAdapter.adapterId, bankAdapter);

    const transportSqlAdapter: AdapterManifest = {
      adapterId: 'adapter:transport:rto-sql',
      name: 'RTO Transport Relational SQL Adapter',
      sourceFormat: 'SQL_RELATIONAL',
      targetSchemaId: 'urn:pramana:schema:trans:permit:v1',
      version: '1.0.0',
      supportedAttributes: [
        CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
        CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
        CANONICAL_ATTRIBUTES.DISTRICT,
        CANONICAL_ATTRIBUTES.DOMICILE_STATE,
      ],
      status: 'ACTIVE',
    };
    this.adapters.set(transportSqlAdapter.adapterId, transportSqlAdapter);

    const civilAdapter: AdapterManifest = {
      adapterId: 'adapter:civil:sql-relational',
      name: 'State Civil Registry SQL Relational Adapter',
      sourceFormat: 'SQL_RELATIONAL',
      targetSchemaId: 'urn:pramana:schema:civil:identity:v1',
      version: '1.0.0',
      supportedAttributes: [
        CANONICAL_ATTRIBUTES.AGE,
        CANONICAL_ATTRIBUTES.BIRTHDATE,
        CANONICAL_ATTRIBUTES.DOMICILE_STATE,
        CANONICAL_ATTRIBUTES.DISTRICT,
      ],
      status: 'ACTIVE',
    };
    this.adapters.set(civilAdapter.adapterId, civilAdapter);

    const civilRestAdapter: AdapterManifest = {
      adapterId: 'adapter:civil:rest-json',
      name: 'State Civil Registry REST API Adapter',
      sourceFormat: 'REST_JSON',
      targetSchemaId: 'urn:pramana:schema:civil:identity:v1',
      version: '1.0.0',
      supportedAttributes: [
        CANONICAL_ATTRIBUTES.AGE,
        CANONICAL_ATTRIBUTES.BIRTHDATE,
        CANONICAL_ATTRIBUTES.DOMICILE_STATE,
        CANONICAL_ATTRIBUTES.DISTRICT,
        CANONICAL_ATTRIBUTES.CITIZENSHIP,
      ],
      status: 'ACTIVE',
    };
    this.adapters.set(civilRestAdapter.adapterId, civilRestAdapter);

    const transportAdapter: AdapterManifest = {
      adapterId: 'adapter:transport:rest-json',
      name: 'Transport Operating Portal REST API Adapter',
      sourceFormat: 'REST_JSON',
      targetSchemaId: 'urn:pramana:schema:trans:permit:v1',
      version: '1.0.0',
      supportedAttributes: [
        CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
        CANONICAL_ATTRIBUTES.LICENSE_CATEGORY,
      ],
      status: 'ACTIVE',
    };
    this.adapters.set(transportAdapter.adapterId, transportAdapter);

    // ------------------------------------------------------------------------
    // 6. Seed Template Bundles (WHO, WHAT, NOT SHARED structured consent data)
    // ------------------------------------------------------------------------
    this.templates.set('PURPOSE_AGE_VERIFICATION:en-US', {
      templateId: 'tmpl:consent:age-verify-v1',
      purposeCode: 'PURPOSE_AGE_VERIFICATION',
      locale: 'en-US',
      templateText:
        '{{verifier_name}} is requesting to verify that you are at least 18 years old. Your date of birth, name, and address will NOT be shared.',
      parameterBindings: ['verifier_name'],
      version: '1.0.0',
      who: {
        role: 'Verifier',
        legalEntity: 'Licensed Access Verifier',
      },
      what: {
        requestedAttributes: [CANONICAL_ATTRIBUTES.AGE],
        predicates: ['age >= 18'],
      },
      notShared: ['date_of_birth', 'full_name', 'residential_address', 'citizenship_record'],
    });

    this.templates.set('PURPOSE_INCOME_CHECK:en-US', {
      templateId: 'tmpl:consent:income-eval-v1',
      purposeCode: 'PURPOSE_INCOME_CHECK',
      locale: 'en-US',
      templateText:
        '{{verifier_name}} is verifying that your annual earnings meet the threshold for loan qualification. Your raw bank statement and transaction history will NOT be shared.',
      parameterBindings: ['verifier_name'],
      version: '1.0.0',
      who: {
        role: 'Financial Institution',
        legalEntity: 'Regulated Credit Assessment Authority',
      },
      what: {
        requestedAttributes: [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS],
        predicates: ['trailing_12m_earnings >= threshold'],
      },
      notShared: ['bank_statement', 'account_number', 'transaction_history', 'bank_balance'],
    });

    this.templates.set('PURPOSE_COMMERCIAL_PERMIT:en-US', {
      templateId: 'tmpl:consent:commercial-permit-v1',
      purposeCode: 'PURPOSE_COMMERCIAL_PERMIT',
      locale: 'en-US',
      templateText:
        '{{verifier_name}} is requesting proof that you hold an active commercial driving permit in this state. Your personal vehicle history and violations will NOT be shared.',
      parameterBindings: ['verifier_name'],
      version: '1.0.0',
      who: {
        role: 'Municipal Authority',
        legalEntity: 'Commercial Licensing Board',
      },
      what: {
        requestedAttributes: [CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS],
        predicates: ['commercial_permit_status == ACTIVE'],
      },
      notShared: ['driving_violations', 'personal_vehicles', 'home_address', 'phone_number'],
    });

    const subsidyTemplate: TemplateBundle = {
      templateId: 'tmpl:consent:fuel-subsidy-v1',
      purposeCode: 'fuel_subsidy_eligibility',
      locale: 'en-US',
      templateText:
        '{{verifier_name}} is requesting to verify your eligibility for the commercial fuel subsidy program. Disclosed: {{disclosed_attributes}}. Proven conditions: {{predicates_summary}}. Your bank account number, individual transactions, exact earnings amount, and residential address will NOT be shared.',
      parameterBindings: ['verifier_name', 'disclosed_attributes', 'predicates_summary'],
      version: '1.0.0',
      who: {
        role: 'Municipal Authority',
        legalEntity: 'Municipal Fuel Subsidy Authority',
      },
      what: {
        requestedAttributes: [CANONICAL_ATTRIBUTES.DISTRICT, 'district'],
        predicates: ['commercial_permit_status == ACTIVE', 'trailing_12m_earnings <= 300000'],
      },
      notShared: [
        'bank_account_number',
        'transaction_history',
        'exact_earnings_amount',
        'residential_address',
        'phone_number',
      ],
    };
    this.templates.set('fuel_subsidy_eligibility:en-US', subsidyTemplate);
    this.templates.set('PURPOSE_FUEL_SUBSIDY:en-US', {
      ...subsidyTemplate,
      purposeCode: 'PURPOSE_FUEL_SUBSIDY',
    });
  }

  // --------------------------------------------------------------------------
  // Read APIs
  // --------------------------------------------------------------------------

  async getIssuer(didOrId: string): Promise<IssuerKey | null> {
    return this.issuers.get(didOrId) ?? null;
  }

  async getVerifierLicence(didOrId: string): Promise<VerifierLicence | null> {
    return this.verifiers.get(didOrId) ?? null;
  }

  async getAttributeDefinition(idOrAlias: string): Promise<AttributeDefinition | null> {
    return this.attributes.get(idOrAlias) ?? null;
  }

  async listAttributes(category?: AttributeCategory): Promise<AttributeDefinition[]> {
    const unique = new Map<string, AttributeDefinition>();
    for (const [key, def] of this.attributes.entries()) {
      if (key === def.id) {
        if (!category || def.category === category) {
          unique.set(def.id, def);
        }
      }
    }
    return Array.from(unique.values());
  }

  async getBridge(bridgeId: string): Promise<BridgeDefinition | null> {
    return this.bridges.get(bridgeId) ?? null;
  }

  async getBridgesForAttribute(canonicalAttributeId: string): Promise<BridgeDefinition[]> {
    const results: BridgeDefinition[] = [];
    for (const bridge of this.bridges.values()) {
      if (bridge.canonicalAttributeId === canonicalAttributeId) {
        results.push(bridge);
      }
    }
    return results;
  }

  async getAdapter(adapterId: string): Promise<AdapterManifest | null> {
    return this.adapters.get(adapterId) ?? null;
  }

  async getAdaptersForAttribute(canonicalAttributeId: string): Promise<AdapterManifest[]> {
    const results: AdapterManifest[] = [];
    for (const adapter of this.adapters.values()) {
      if (adapter.supportedAttributes.includes(canonicalAttributeId)) {
        results.push(adapter);
      }
    }
    return results;
  }

  async getTemplate(purposeCode: string, locale: string = 'en-US'): Promise<TemplateBundle | null> {
    const key = `${purposeCode}:${locale}`;
    return this.templates.get(key) ?? this.templates.get(`${purposeCode}:en-US`) ?? null;
  }

  async getLatestCheckpoint(): Promise<TrustCheckpoint> {
    return {
      epoch: 1,
      merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      publishedAt: '2026-01-01T00:00:00Z',
      signature: 'checkpoint_root_authority_signature_placeholder',
      checkpointAuthority: 'did:pramana:authority:root',
    };
  }

  // --------------------------------------------------------------------------
  // Write / Registration APIs (Protected by strict schema & anti-PII checks)
  // --------------------------------------------------------------------------

  async registerIssuer(record: IssuerKey): Promise<void> {
    const validated = validateIssuerKey(record);
    this.issuers.set(validated.did, validated);
    if (validated.issuerId) {
      this.issuers.set(validated.issuerId, validated);
    }
  }

  async registerVerifierLicence(licence: VerifierLicence): Promise<void> {
    const validated = validateVerifierLicence(licence);
    this.verifiers.set(validated.did, validated);
    if (validated.verifierId) {
      this.verifiers.set(validated.verifierId, validated);
    }
  }

  async registerAttributeDefinition(def: AttributeDefinition): Promise<void> {
    const validated = validateAttributeDef(def);
    this.attributes.set(validated.id, validated);
    this.attributes.set(validated.name, validated);
  }

  async registerBridge(bridge: BridgeDefinition): Promise<void> {
    const validated = validateBridge(bridge);
    this.bridges.set(validated.bridgeId, validated);
  }

  async registerAdapter(manifest: AdapterManifest): Promise<void> {
    const validated = validateAdapterManifest(manifest);
    this.adapters.set(validated.adapterId, validated);
  }

  async registerTemplate(template: TemplateBundle): Promise<void> {
    const validated = validateTemplateBundle(template);
    const key = `${validated.purposeCode}:${validated.locale}`;
    this.templates.set(key, validated);
  }
}

export const trustRegistry = new InMemoryTrustRegistry();
export const checkpointVerifier = new TrustCheckpointVerifier();
