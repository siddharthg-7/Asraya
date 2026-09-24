import {
  VerificationResult,
  AuditReceipt,
  VerifierAuditRecord,
  ProofStateMachineState,
} from '../../types/protocol';
import { pramanaService } from '../mock/mockPramanaService';

export const proofService = {
  async generateProofWithState(
    requestId: string,
    onStateChange?: (state: ProofStateMachineState) => void,
  ): Promise<{
    result: VerificationResult;
    receipt: AuditReceipt;
    verifierAudit: VerifierAuditRecord;
  }> {
    onStateChange?.('CONSENT_GRANTED');
    await new Promise((r) => setTimeout(r, 200));

    onStateChange?.('PREPARING');
    await new Promise((r) => setTimeout(r, 400));

    onStateChange?.('GENERATING');
    await new Promise((r) => setTimeout(r, 600));

    try {
      const proofPayload = await pramanaService.generateProof(requestId);
      onStateChange?.('READY');
      return proofPayload;
    } catch (err) {
      onStateChange?.('FAILED');
      throw err;
    }
  },
};
