/**
 * @fileoverview Synthetic Institutional Data Fixtures
 * Pramāṇa Protocol - Phase 3 Schema Mediation
 *
 * NOTICE:
 * MOCK - DEMO ONLY - NOT PRODUCTION DATA
 * Contains strictly synthetic/fictional citizen identifiers and records.
 * Zero real citizen personal data.
 */

// ============================================================================
// SOURCE DATA INTERFACES
// ============================================================================

/**
 * Legacy Transport Relational SQL Source Record
 */
export interface TransportSqlPermitRow {
  readonly PERMIT_ID: string;
  readonly HOLDER_SYNTH_ID: string;
  readonly STATUS_CD: 'ACTV' | 'EXPR' | 'SUSP' | 'PEND';
  readonly CLASS_CD: 'COMM_HEAVY' | 'COMM_LIGHT' | 'PVT_LMV';
  readonly ISSUE_DT: string; // 'YYYY-MM-DD'
  readonly EXPIRY_DT: string; // 'YYYY-MM-DD'
  readonly DISTRICT_NAME: string;
  readonly STATE_CODE: string;
  readonly RAW_VEHICLE_REG_NO?: string; // Source-specific sensitive field!
  readonly INSPECTION_OFFICER_ID?: string; // Source-specific internal field!
}

/**
 * Bank ISO 20022 CAMT.053 Statement Source Record
 */
export interface Camt053StatementSource {
  readonly statementId: string;
  readonly holderSynthId: string;
  readonly accountIban: string; // Source-specific internal identifier!
  readonly closingBalanceAmount: number;
  readonly currency: string;
  readonly creditDebitIndicator: 'CRDT' | 'DBIT';
  readonly trailing12mCreditSum: number; // Aggregate sum of business credits over 365 days
  readonly rawTransactionsCount?: number;
  readonly branchRoutingCode?: string; // Source-specific internal routing!
  readonly statementXml?: string; // Optional raw ISO 20022 XML representation
}

/**
 * Municipal / Civil Registration REST Source Record
 */
export interface MunicipalRestCitizenPayload {
  readonly registration_id: string;
  readonly citizen_synth_id: string;
  readonly date_of_birth: string; // 'YYYY-MM-DD'
  readonly state_code: string;
  readonly district_name: string;
  readonly nationality_code: string;
  readonly residential_address?: string; // Source-specific sensitive field!
  readonly municipal_ward_id?: number; // Source-specific internal field!
  readonly active_status: boolean;
}

// ============================================================================
// SYNTHETIC FIXTURE SCENARIOS
// ============================================================================

export interface SyntheticCitizenScenario {
  readonly synthId: string;
  readonly alias: string;
  readonly description: string;
  readonly transportSql: TransportSqlPermitRow;
  readonly bankCamt053: Camt053StatementSource;
  readonly municipalRest: MunicipalRestCitizenPayload;
}

/**
 * 1. Alice (Scenario: Fully Qualified Commercial Driver)
 * - Commercial permit: ACTIVE, Light Commercial
 * - Earnings: 480,000 INR (Above 300k threshold)
 * - Domicile: KA / Bangalore Urban
 * - Age: Born 1995 (31 years old)
 */
export const SYNTHETIC_ALICE: SyntheticCitizenScenario = {
  synthId: 'synth:citizen:alice-01',
  alias: 'Alice',
  description:
    'Fully qualified applicant meeting permit, earnings threshold, and domicile criteria',
  transportSql: {
    PERMIT_ID: 'PERM-KA-2024-1001',
    HOLDER_SYNTH_ID: 'synth:citizen:alice-01',
    STATUS_CD: 'ACTV',
    CLASS_CD: 'COMM_LIGHT',
    ISSUE_DT: '2024-01-15',
    EXPIRY_DT: '2029-01-14',
    DISTRICT_NAME: 'Bangalore Urban',
    STATE_CODE: 'KA',
    RAW_VEHICLE_REG_NO: 'KA-01-AB-1234',
    INSPECTION_OFFICER_ID: 'OFF-KA-559',
  },
  bankCamt053: {
    statementId: 'STMT-2026-ALICE-01',
    holderSynthId: 'synth:citizen:alice-01',
    accountIban: 'IN00MOCK00001234567890',
    closingBalanceAmount: 154200.5,
    currency: 'INR',
    creditDebitIndicator: 'CRDT',
    trailing12mCreditSum: 480000, // Meets threshold
    rawTransactionsCount: 142,
    branchRoutingCode: 'MOCK-BLR-01',
  },
  municipalRest: {
    registration_id: 'CIVIL-KA-1995-9988',
    citizen_synth_id: 'synth:citizen:alice-01',
    date_of_birth: '1995-05-12',
    state_code: 'KA',
    district_name: 'Bangalore Urban',
    nationality_code: 'IND',
    residential_address: '123 Privacy Lane, Koramangala, Bangalore',
    municipal_ward_id: 151,
    active_status: true,
  },
};

/**
 * 2. Bob (Scenario: Low Earnings / Below Threshold)
 * - Commercial permit: ACTIVE
 * - Earnings: 180,000 INR (Below 300k threshold)
 * - Domicile: KA / Bangalore Urban
 */
export const SYNTHETIC_BOB: SyntheticCitizenScenario = {
  synthId: 'synth:citizen:bob-02',
  alias: 'Bob',
  description: 'Active permit holder whose trailing earnings fall below financial threshold',
  transportSql: {
    PERMIT_ID: 'PERM-KA-2023-2002',
    HOLDER_SYNTH_ID: 'synth:citizen:bob-02',
    STATUS_CD: 'ACTV',
    CLASS_CD: 'COMM_LIGHT',
    ISSUE_DT: '2023-04-10',
    EXPIRY_DT: '2028-04-09',
    DISTRICT_NAME: 'Bangalore Urban',
    STATE_CODE: 'KA',
    RAW_VEHICLE_REG_NO: 'KA-02-CD-5678',
  },
  bankCamt053: {
    statementId: 'STMT-2026-BOB-02',
    holderSynthId: 'synth:citizen:bob-02',
    accountIban: 'IN00MOCK00009876543210',
    closingBalanceAmount: 18200.0,
    currency: 'INR',
    creditDebitIndicator: 'CRDT',
    trailing12mCreditSum: 180000, // Below threshold
    rawTransactionsCount: 45,
  },
  municipalRest: {
    registration_id: 'CIVIL-KA-1998-3344',
    citizen_synth_id: 'synth:citizen:bob-02',
    date_of_birth: '1998-08-20',
    state_code: 'KA',
    district_name: 'Bangalore Urban',
    nationality_code: 'IND',
    residential_address: '456 Minimization Way, Indiranagar, Bangalore',
    active_status: true,
  },
};

/**
 * 3. Carol (Scenario: Expired / Inactive Permit)
 * - Commercial permit: EXPIRED
 * - Earnings: 550,000 INR (High earnings)
 * - Domicile: KA / Bangalore Urban
 */
export const SYNTHETIC_CAROL: SyntheticCitizenScenario = {
  synthId: 'synth:citizen:carol-03',
  alias: 'Carol',
  description: 'High earner whose transport operating permit is expired',
  transportSql: {
    PERMIT_ID: 'PERM-KA-2018-3003',
    HOLDER_SYNTH_ID: 'synth:citizen:carol-03',
    STATUS_CD: 'EXPR', // Expired
    CLASS_CD: 'COMM_LIGHT',
    ISSUE_DT: '2018-01-01',
    EXPIRY_DT: '2023-01-01',
    DISTRICT_NAME: 'Bangalore Urban',
    STATE_CODE: 'KA',
    RAW_VEHICLE_REG_NO: 'KA-03-EF-9012',
  },
  bankCamt053: {
    statementId: 'STMT-2026-CAROL-03',
    holderSynthId: 'synth:citizen:carol-03',
    accountIban: 'IN00MOCK00005555555555',
    closingBalanceAmount: 320000.0,
    currency: 'INR',
    creditDebitIndicator: 'CRDT',
    trailing12mCreditSum: 550000,
  },
  municipalRest: {
    registration_id: 'CIVIL-KA-1992-5566',
    citizen_synth_id: 'synth:citizen:carol-03',
    date_of_birth: '1992-03-10',
    state_code: 'KA',
    district_name: 'Bangalore Urban',
    nationality_code: 'IND',
    active_status: true,
  },
};

/**
 * 4. Dave (Scenario: Different District & State)
 * - Commercial permit: ACTIVE, Heavy Commercial
 * - Earnings: 620,000 INR
 * - Domicile: MH / Mumbai Suburban (Out of state for a KA local program)
 */
export const SYNTHETIC_DAVE: SyntheticCitizenScenario = {
  synthId: 'synth:citizen:dave-04',
  alias: 'Dave',
  description: 'Valid permit holder registered in a different district and jurisdiction state',
  transportSql: {
    PERMIT_ID: 'PERM-MH-2022-4004',
    HOLDER_SYNTH_ID: 'synth:citizen:dave-04',
    STATUS_CD: 'ACTV',
    CLASS_CD: 'COMM_HEAVY',
    ISSUE_DT: '2022-06-01',
    EXPIRY_DT: '2027-05-31',
    DISTRICT_NAME: 'Mumbai Suburban',
    STATE_CODE: 'MH',
    RAW_VEHICLE_REG_NO: 'MH-02-GH-3456',
  },
  bankCamt053: {
    statementId: 'STMT-2026-DAVE-04',
    holderSynthId: 'synth:citizen:dave-04',
    accountIban: 'IN00MOCK00007777777777',
    closingBalanceAmount: 210000.0,
    currency: 'INR',
    creditDebitIndicator: 'CRDT',
    trailing12mCreditSum: 620000,
  },
  municipalRest: {
    registration_id: 'CIVIL-MH-1988-7788',
    citizen_synth_id: 'synth:citizen:dave-04',
    date_of_birth: '1988-11-04',
    state_code: 'MH',
    district_name: 'Mumbai Suburban',
    nationality_code: 'IND',
    active_status: true,
  },
};

export const ALL_SYNTHETIC_SCENARIOS = [
  SYNTHETIC_ALICE,
  SYNTHETIC_BOB,
  SYNTHETIC_CAROL,
  SYNTHETIC_DAVE,
] as const;

export function getSyntheticScenario(synthId: string): SyntheticCitizenScenario | undefined {
  return ALL_SYNTHETIC_SCENARIOS.find((s) => s.synthId === synthId);
}
