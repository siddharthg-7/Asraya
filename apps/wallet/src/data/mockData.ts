import type { CredentialClaim, VerificationRequest, AuditReceipt } from '../types/protocol.ts';

/**
 * Synthetic Mock Data Fixtures for ĀŚRAYA Demo
 * Standardized synthetic credentials and verification requests.
 */

export const MOCK_CITIZEN_WALLET = {
  walletDid: 'did:asraya:citizen:demo-8f92a4',
  name: 'Aditya Sharma (Demo Citizen)',
  status: 'ACTIVE_ENCLAVE_READY',
  tierSupport: ['TIER_A_BBS_PLUS', 'TIER_B_GROTH16'],
};

export const MOCK_CREDENTIALS: CredentialClaim[] = [
  {
    id: 'vc-national-id-9982',
    issuerDid: 'did:asraya:issuer:uidai-demo-authority',
    issuerName: 'National Unique Identity Authority (UIDAI)',
    credentialType: 'Aadhaar / Resident Card',
    issuedAt: '2023-04-15T00:00:00Z',
    expiresAt: '2033-04-15T00:00:00Z',
    attributes: {
      fullName: 'Aditya Sharma',
      dateOfBirth: '1996-08-14',
      age: 29,
      gender: 'M',
      addressLine: '42 MG Road, Koramangala',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pinCode: 560034,
      residentStatus: 'PERMANENT',
    },
    isMock: true,
  },
  {
    id: 'vc-income-cert-4412',
    issuerDid: 'did:asraya:issuer:karnataka-revenue-dept',
    issuerName: 'Dept of Revenue, Govt of Karnataka',
    credentialType: 'Annual Income Certificate',
    issuedAt: '2025-01-10T00:00:00Z',
    expiresAt: '2026-01-10T00:00:00Z',
    attributes: {
      certificateNumber: 'KAR/REV/2025/8892',
      annualIncomeInINR: 240000,
      incomeBracket: 'SUB_3L',
      isTaxExempt: true,
    },
    isMock: true,
  },
  {
    id: 'vc-comm-permit-7719',
    issuerDid: 'did:asraya:issuer:bengaluru-transport-dept',
    issuerName: 'Transport Department, RTO Bengaluru East',
    credentialType: 'Commercial Driver & Electric Permit',
    issuedAt: '2024-06-01T00:00:00Z',
    expiresAt: '2027-06-01T00:00:00Z',
    attributes: {
      permitNumber: 'KA-01-COMM-2024-9182',
      vehicleCategory: 'EV_THREE_WHEELER',
      isValidPermit: true,
      commercialCategory: 'PUBLIC_PASSENGER',
      issuingDistrict: 'Bengaluru Urban',
    },
    isMock: true,
  },
];

export const MOCK_PENDING_REQUESTS: VerificationRequest[] = [
  {
    id: 'req-ev-subsidy-2026',
    verifierDid: 'did:asraya:verifier:municipal-ev-dept',
    verifierName: 'Municipal EV Subsidy Office',
    verifierCategory: 'Municipal',
    purpose: 'Verification for 2026 Commercial Electric Vehicle Fleet Grant & Tariff Exemption',
    purposeCode: 'GOVT_EV_SUBSIDY_2026',
    expiryTimestamp: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdTimestamp: new Date().toISOString(),
    nonce: '0x8f9a2b7c4d1e902a3f5b7c8d9e0f1a2b',
    tier: 'TIER_A_BBS_PLUS',
    status: 'PENDING',
    privacyNotice:
      'Āśraya Zero-Knowledge Guarantee: Your raw document numbers, exact income figures, and home address WILL NOT be shared. Only boolean proof answers are sent.',
    predicates: [
      {
        id: 'pred-1',
        field: 'isValidPermit',
        label: 'Valid Commercial EV Permit',
        operator: 'IS_TRUE',
        targetValue: true,
        description:
          'Verify active commercial vehicle permit without revealing permit registration code',
      },
      {
        id: 'pred-2',
        field: 'annualIncomeInINR',
        label: 'Annual Income Threshold',
        operator: 'LTE',
        targetValue: 300000,
        description:
          'Verify annual income is below ₹3,00,000 without revealing exact salary figure',
      },
      {
        id: 'pred-3',
        field: 'state',
        label: 'Eligible State Jurisdiction',
        operator: 'EQ',
        targetValue: 'Karnataka',
        description: 'Verify residency in Karnataka without exposing full home address',
      },
    ],
  },
  {
    id: 'req-senior-pass-9921',
    verifierDid: 'did:asraya:verifier:metro-transit-authority',
    verifierName: 'Bengaluru Metro Transit (BMRCL)',
    verifierCategory: 'Transport',
    purpose: 'Concession Transit Pass Eligibility Verification',
    purposeCode: 'TRANSIT_CONCESSION_PASS',
    expiryTimestamp: new Date(Date.now() + 86400000 * 7).toISOString(),
    createdTimestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    nonce: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    tier: 'TIER_A_BBS_PLUS',
    status: 'PENDING',
    privacyNotice: 'Your date of birth and ID card number will remain private inside your wallet.',
    predicates: [
      {
        id: 'pred-4',
        field: 'age',
        label: 'Minimum Age Requirement',
        operator: 'GTE',
        targetValue: 18,
        description: 'Verify age is 18 or above without revealing birth date or legal name',
      },
    ],
  },
];

export const INITIAL_MOCK_RECEIPTS: AuditReceipt[] = [
  {
    receiptId: 'rcpt-99201-abc',
    requestId: 'req-past-housing-check',
    citizenWalletDid: MOCK_CITIZEN_WALLET.walletDid,
    verifierDid: 'did:asraya:verifier:state-housing-board',
    verifierName: 'State Affordable Housing Board',
    timestamp: '2026-09-20T14:22:10Z',
    purpose: 'Affordable Housing Priority Allocation Verification',
    disclosedPredicatesCount: 2,
    rawAttributesExposed: 0,
    receiptHash: '0xa49f7e82b1c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
    signature: 'sig:bbs:0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
  },
];
