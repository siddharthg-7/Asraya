import type { IPramanaService } from '../api/pramanaService.ts';
import type {
  VerificationRequest,
  VerificationResult,
  AuditReceipt,
  CredentialClaim,
  BoundedPredicate,
  VerifierAuditRecord,
} from '../../types/protocol.ts';
import {
  MOCK_CITIZEN_WALLET,
  MOCK_CREDENTIALS,
  MOCK_PENDING_REQUESTS,
  INITIAL_MOCK_RECEIPTS,
} from '../../data/mockData.ts';

class MockPramanaService implements IPramanaService {
  private requests: VerificationRequest[] = [...MOCK_PENDING_REQUESTS];
  private credentials: CredentialClaim[] = [...MOCK_CREDENTIALS];
  private receipts: AuditReceipt[] = [...INITIAL_MOCK_RECEIPTS];
  private verifierAudits: VerifierAuditRecord[] = [];

  private async simulateNetworkDelay(ms: number = 600): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getPendingRequests(): Promise<VerificationRequest[]> {
    await this.simulateNetworkDelay(300);
    return [...this.requests];
  }

  async getCredentials(): Promise<CredentialClaim[]> {
    await this.simulateNetworkDelay(200);
    return [...this.credentials];
  }

  async getReceipts(): Promise<AuditReceipt[]> {
    await this.simulateNetworkDelay(200);
    return [...this.receipts];
  }

  async createVerificationRequest(params: {
    verifierName: string;
    purpose: string;
    purposeCode: string;
    predicates: Omit<BoundedPredicate, 'id'>[];
  }): Promise<VerificationRequest> {
    await this.simulateNetworkDelay(400);

    const newRequest: VerificationRequest = {
      id: `req-${Date.now().toString(36)}`,
      verifierDid: `did:asraya:verifier:${params.verifierName.toLowerCase().replace(/\s+/g, '-')}`,
      verifierName: params.verifierName,
      verifierCategory: 'Government',
      purpose: params.purpose,
      purposeCode: params.purposeCode,
      expiryTimestamp: new Date(Date.now() + 86400000 * 3).toISOString(),
      createdTimestamp: new Date().toISOString(),
      nonce: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      tier: 'TIER_A_BBS_PLUS',
      status: 'PENDING',
      privacyNotice:
        'Āśraya Guarantee: Bounded question proof requested. ZERO raw credentials or PII transferred.',
      predicates: params.predicates.map((p, idx) => ({
        ...p,
        id: `pred-custom-${idx + 1}-${Date.now()}`,
      })),
    };

    this.requests.unshift(newRequest);
    return newRequest;
  }

  async approveRequest(
    requestId: string,
  ): Promise<{ status: 'GENERATING_PROOF'; requestId: string }> {
    await this.simulateNetworkDelay(300);
    const req = this.requests.find((r) => r.id === requestId);
    if (req) {
      req.status = 'CONSENTED';
    }
    return { status: 'GENERATING_PROOF', requestId };
  }

  async generateProof(requestId: string): Promise<{
    result: VerificationResult;
    receipt: AuditReceipt;
    verifierAudit: VerifierAuditRecord;
  }> {
    await this.simulateNetworkDelay(1200); // Simulate zero-knowledge proof generation computation

    const req = this.requests.find((r) => r.id === requestId);
    if (!req) {
      throw new Error(`Request ID ${requestId} not found`);
    }

    req.status = 'VERIFIED';

    // Evaluate predicates locally against synthetic citizen credentials
    const predicateResults = req.predicates.map((pred) => {
      // Find matching attribute in citizen claims
      let satisfied = true;
      if (pred.field === 'annualIncomeInINR') {
        const claim = this.credentials.find((c) => 'annualIncomeInINR' in c.attributes);
        const income = (claim?.attributes.annualIncomeInINR as number) || 0;
        satisfied = income <= (pred.targetValue as number);
      } else if (pred.field === 'isValidPermit') {
        const claim = this.credentials.find((c) => 'isValidPermit' in c.attributes);
        satisfied = Boolean(claim?.attributes.isValidPermit);
      } else if (pred.field === 'state') {
        const claim = this.credentials.find((c) => 'state' in c.attributes);
        satisfied = claim?.attributes.state === pred.targetValue;
      } else if (pred.field === 'age') {
        const claim = this.credentials.find((c) => 'age' in c.attributes);
        satisfied = ((claim?.attributes.age as number) || 0) >= (pred.targetValue as number);
      }

      return {
        predicateId: pred.id,
        field: pred.field,
        label: pred.label,
        satisfied,
      };
    });

    const isSuccess = predicateResults.every((r) => r.satisfied);
    const timestamp = new Date().toISOString();
    const receiptHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const result: VerificationResult = {
      id: `res-${Date.now()}`,
      requestId: req.id,
      verifierName: req.verifierName,
      verifierDid: req.verifierDid,
      verifiedAt: timestamp,
      isSuccess,
      tierUsed: req.tier,
      predicateResults,
      nonce: req.nonce,
      receiptHash,
      isSimulatedDemo: true, // Technical Honesty Flag
    };

    const receipt: AuditReceipt = {
      receiptId: `rcpt-${Date.now().toString(36)}`,
      requestId: req.id,
      citizenWalletDid: MOCK_CITIZEN_WALLET.walletDid,
      verifierDid: req.verifierDid,
      verifierName: req.verifierName,
      timestamp,
      purpose: req.purpose,
      disclosedPredicatesCount: req.predicates.length,
      rawAttributesExposed: 0,
      receiptHash,
      signature: `sig:bbs:${receiptHash.substring(0, 32)}`,
    };

    const verifierAudit: VerifierAuditRecord = {
      sessionId: `sess-${Date.now().toString(36)}`,
      requestId: req.id,
      timestamp,
      purpose: req.purpose,
      verdict: isSuccess ? 'VALID_PROOF' : 'INVALID_PROOF',
      receiptHash,
      nonce: req.nonce,
      rawAttributesSaved: 0, // Strict invariant
    };

    this.receipts.unshift(receipt);
    this.verifierAudits.unshift(verifierAudit);

    return { result, receipt, verifierAudit };
  }

  async rejectRequest(requestId: string): Promise<{ status: 'REJECTED'; requestId: string }> {
    await this.simulateNetworkDelay(300);
    const req = this.requests.find((r) => r.id === requestId);
    if (req) {
      req.status = 'REJECTED';
    }

    const timestamp = new Date().toISOString();
    const receiptHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    if (req) {
      this.verifierAudits.unshift({
        sessionId: `sess-rej-${Date.now().toString(36)}`,
        requestId: req.id,
        timestamp,
        purpose: req.purpose,
        verdict: 'REJECTED_BY_CITIZEN',
        receiptHash,
        nonce: req.nonce,
        rawAttributesSaved: 0,
      });
    }

    return { status: 'REJECTED', requestId };
  }

  async getVerifierAuditLogs(): Promise<VerifierAuditRecord[]> {
    await this.simulateNetworkDelay(200);
    return [...this.verifierAudits];
  }
}

export const pramanaService: IPramanaService = new MockPramanaService();
