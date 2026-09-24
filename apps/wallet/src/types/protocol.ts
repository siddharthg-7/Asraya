/**
 * ĀŚRAYA Protocol Domain Types
 * Strict typing for Citizen Wallet, Verifier Requests, Predicates, Mocks, and Audit Receipts.
 */

export type ProofEngineTier = 'TIER_A_BBS_PLUS' | 'TIER_B_GROTH16';

export type RequestStatus = 'PENDING' | 'CONSENTED' | 'GENERATING_PROOF' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export type ProofStateMachineState =
  | 'REQUEST_RECEIVED'
  | 'CONSENT_PENDING'
  | 'CONSENT_GRANTED'
  | 'PREPARING'
  | 'GENERATING'
  | 'READY'
  | 'FAILED';

export interface BoundedPredicate {
  id: string;
  field: string;
  label: string;
  operator: 'GTE' | 'LTE' | 'EQ' | 'IN_SET' | 'IS_TRUE';
  targetValue: string | number | boolean | string[];
  description: string;
}

export interface VerificationRequest {
  id: string;
  verifierDid: string;
  verifierName: string;
  verifierCategory: 'Government' | 'Municipal' | 'Financial' | 'Transport';
  purpose: string;
  purposeCode: string;
  expiryTimestamp: string;
  createdTimestamp: string;
  nonce: string;
  callbackUrl?: string;
  predicates: BoundedPredicate[];
  tier: ProofEngineTier;
  status: RequestStatus;
  privacyNotice: string;
}

export interface CredentialClaim {
  id: string;
  issuerDid: string;
  issuerName: string;
  credentialType: string;
  issuedAt: string;
  expiresAt: string;
  attributes: Record<string, string | number | boolean>;
  isMock: boolean;
}

export interface VerificationResult {
  id: string;
  requestId: string;
  verifierName: string;
  verifierDid: string;
  verifiedAt: string;
  isSuccess: boolean;
  tierUsed: ProofEngineTier;
  predicateResults: Array<{
    predicateId: string;
    field: string;
    label: string;
    satisfied: boolean;
    disclosedAttributeValue?: never; // CRITICAL: NEVER expose raw attribute value to verifier
  }>;
  nonce: string;
  receiptHash: string;
  isSimulatedDemo: boolean;
}

export interface AuditReceipt {
  receiptId: string;
  requestId: string;
  citizenWalletDid: string;
  verifierDid: string;
  verifierName: string;
  timestamp: string;
  purpose: string;
  disclosedPredicatesCount: number;
  rawAttributesExposed: 0; // Fixed zero per protocol invariant
  receiptHash: string;
  signature: string;
}

export interface VerifierAuditRecord {
  sessionId: string;
  requestId: string;
  timestamp: string;
  purpose: string;
  verdict: 'VALID_PROOF' | 'INVALID_PROOF' | 'REJECTED_BY_CITIZEN';
  receiptHash: string;
  nonce: string;
  rawAttributesSaved: 0; // Verifier stores 0 raw PII attributes
}

export type ProtocolErrorType =
  | 'EXPIRED_REQUEST'
  | 'INVALID_REQUEST'
  | 'CONSENT_DECLINED'
  | 'PROOF_GENERATION_FAILED'
  | 'VERIFICATION_FAILED'
  | 'NETWORK_UNAVAILABLE'
  | 'SESSION_EXPIRED';

export interface ProtocolErrorState {
  type: ProtocolErrorType;
  title: string;
  message: string;
  recoveryActionLabel: string;
}
