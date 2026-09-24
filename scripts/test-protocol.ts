import { pramanaService } from '../apps/wallet/src/services/mock/mockPramanaService.ts';
import { requestService } from '../apps/wallet/src/services/api/requestService.ts';

async function runProtocolTests() {
  console.log('🧪 Starting ĀŚRAYA Protocol Integration & Security Test Suite...\n');

  try {
    // 1. Verifier creates request
    console.log('Step 1: Creating Verifier Request...');
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

    if (!request.id || request.status !== 'PENDING') {
      throw new Error('Failed to create pending verification request');
    }
    console.log(`✅ Request Created: ${request.id}`);

    // 2. Citizen approves consent
    console.log('Step 2: Approving Citizen Consent...');
    const consentRes = await pramanaService.approveRequest(request.id);
    if (consentRes.status !== 'GENERATING_PROOF') {
      throw new Error('Consent approval failed');
    }
    console.log('✅ Consent Approved -> State set to GENERATING_PROOF');

    // 3. Generate ZK Proof & evaluate predicates
    console.log('Step 3: Generating ZK Proof & Verifying Invariants...');
    const proofRes = await pramanaService.generateProof(request.id);

    if (!proofRes.result.isSuccess) {
      throw new Error('Proof verification returned failure');
    }
    if (proofRes.receipt.rawAttributesExposed !== 0) {
      throw new Error('CRITICAL INVARIANT VIOLATION: Raw attributes exposed!');
    }
    if (proofRes.verifierAudit.rawAttributesSaved !== 0) {
      throw new Error('CRITICAL INVARIANT VIOLATION: Verifier stored raw PII!');
    }

    console.log('✅ Proof Verified! Zero Raw Attributes Exposed (0 Bytes PII stored).');
    console.log(`✅ Audit Receipt Hash: ${proofRes.receipt.receiptHash}`);

    // 4. Negative test case: Decline consent
    console.log('\nStep 4: Testing Negative Case (Consent Declined)...');
    const declRequest = await requestService.createRequest({
      verifierName: 'Unauthorized Third Party',
      purpose: 'Unrestricted Data Ingestion',
      purposeCode: 'UNAUTHORIZED',
      predicates: [],
    });

    await pramanaService.rejectRequest(declRequest.id);
    const auditLogs = await pramanaService.getVerifierAuditLogs();
    const rejectedLog = auditLogs.find((l) => l.requestId === declRequest.id);

    if (rejectedLog?.verdict !== 'REJECTED_BY_CITIZEN' || rejectedLog.rawAttributesSaved !== 0) {
      throw new Error('Negative test case failed: Reject audit logging invalid');
    }
    console.log('✅ Negative Case PASSED: Request rejected with 0 PII stored.');

    console.log('\n🎉 ALL 4 PROTOCOL INTEGRATION TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Test Execution Error:', err);
    process.exit(1);
  }
}

runProtocolTests();
