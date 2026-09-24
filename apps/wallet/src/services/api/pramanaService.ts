import type {
  VerificationRequest,
  VerificationResult,
  AuditReceipt,
  CredentialClaim,
  BoundedPredicate,
  VerifierAuditRecord,
} from '../../types/protocol.ts';

export interface IPramanaService {
  getPendingRequests(): Promise<VerificationRequest[]>;
  getCredentials(): Promise<CredentialClaim[]>;
  getReceipts(): Promise<AuditReceipt[]>;
  
  createVerificationRequest(params: {
    verifierName: string;
    purpose: string;
    purposeCode: string;
    predicates: Omit<BoundedPredicate, 'id'>[];
  }): Promise<VerificationRequest>;

  approveRequest(requestId: string): Promise<{
    status: 'GENERATING_PROOF';
    requestId: string;
  }>;

  generateProof(requestId: string): Promise<{
    result: VerificationResult;
    receipt: AuditReceipt;
    verifierAudit: VerifierAuditRecord;
  }>;

  rejectRequest(requestId: string): Promise<{
    status: 'REJECTED';
    requestId: string;
  }>;

  getVerifierAuditLogs(): Promise<VerifierAuditRecord[]>;
}
