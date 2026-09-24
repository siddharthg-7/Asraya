import { describe, it, expect, beforeEach } from 'vitest';
import { pramanaService } from '../apps/wallet/src/services/mock/mockPramanaService';
import { requestService } from '../apps/wallet/src/services/api/requestService';

describe('ĀŚRAYA Frontend Protocol & Lifecycle Integration Tests', () => {
  beforeEach(async () => {
    // Reset state before each test if needed
  });

  it('Happy Path E2E: Verifier Request → Citizen Consent → Proof Gen → Verified Verdict → Zero-PII Audit Receipt', async () => {
    // 1. Verifier creates request
    const request = await requestService.createRequest({
      verifierName: 'State Transport Authority',
      purpose: 'Commercial Transit Subsidy Verification',
      purposeCode: 'TRANSIT_SUBSIDY_2026',
      predicates: [
        {
          field: 'isValidPermit',
          label: 'Valid Commercial Permit',
          operator: 'IS_TRUE',
          targetValue: true,
          description: 'Must hold valid permit',
        },
        {
          field: 'annualIncomeInINR',
          label: 'Income Threshold',
          operator: 'LTE',
          targetValue: 300000,
          description: 'Income <= 3L',
        },
      ],
    });

    expect(request.id).toBeDefined();
    expect(request.status).toBe('PENDING');

    // 2. Citizen approves consent
    const consentRes = await pramanaService.approveRequest(request.id);
    expect(consentRes.status).toBe('GENERATING_PROOF');

    // 3. Generate ZK Proof & evaluate predicates
    const proofRes = await pramanaService.generateProof(request.id);

    expect(proofRes.result.isSuccess).toBe(true);
    expect(proofRes.result.tierUsed).toBe('TIER_A_BBS_PLUS');
    expect(proofRes.result.predicateResults.length).toBe(2);

    // CRITICAL INVARIANT: 0 Raw PII Exposed
    expect(proofRes.receipt.rawAttributesExposed).toBe(0);
    expect(proofRes.verifierAudit.rawAttributesSaved).toBe(0);
    expect(proofRes.verifierAudit.verdict).toBe('VALID_PROOF');
  });

  it('Negative Case: Citizen Declines Consent → Request set to REJECTED with 0 PII leak', async () => {
    const request = await requestService.createRequest({
      verifierName: 'Unrecognized Entity',
      purpose: 'Over-broad Data Request',
      purposeCode: 'UNAUTHORIZED_INQUIRY',
      predicates: [],
    });

    const declineRes = await pramanaService.rejectRequest(request.id);
    expect(declineRes.status).toBe('REJECTED');

    const auditLogs = await pramanaService.getVerifierAuditLogs();
    const rejectedLog = auditLogs.find((l) => l.requestId === request.id);

    expect(rejectedLog).toBeDefined();
    expect(rejectedLog?.verdict).toBe('REJECTED_BY_CITIZEN');
    expect(rejectedLog?.rawAttributesSaved).toBe(0);
  });

  it('Audit Integrity: Receipts contain canonical DID formats and valid signature hashes', async () => {
    const receipts = await pramanaService.getReceipts();
    expect(receipts.length).toBeGreaterThan(0);

    const firstReceipt = receipts[0]!;
    expect(firstReceipt.citizenWalletDid).toContain('did:asraya:');
    expect(firstReceipt.verifierDid).toContain('did:asraya:');
    expect(firstReceipt.receiptHash).toMatch(/^0x[a-f0-9]+$/i);
  });
});
