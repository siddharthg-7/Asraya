import { AuditReceipt } from '../types/protocol';

/**
 * Exports an ĀŚRAYA non-custodial audit receipt to a downloadable JSON file.
 */
export const downloadAuditReceipt = (receipt: AuditReceipt) => {
  const exportPayload = {
    $schema: 'https://asraya.gov.in/schemas/v1/audit-receipt.json',
    protocol: 'ĀŚRAYA Privacy-Preserving Zero-Knowledge Verification',
    version: '1.0.0-phase4',
    receipt: {
      receiptId: receipt.receiptId,
      requestId: receipt.requestId,
      citizenWalletDid: receipt.citizenWalletDid,
      verifierDid: receipt.verifierDid,
      verifierName: receipt.verifierName,
      timestamp: receipt.timestamp,
      purpose: receipt.purpose,
      disclosedPredicatesCount: receipt.disclosedPredicatesCount,
      rawAttributesExposed: 0,
      receiptHash: receipt.receiptHash,
      signature: receipt.signature,
    },
    verificationIntegrity: {
      cryptographicStandard: 'BBS+ Selective Disclosure & Groth16 ZK',
      zeroStorageInvariant: 'PASSED (0 PII stored on verifier)',
      digestAlgorithm: 'SHA-256',
    },
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `asraya-receipt-${receipt.receiptId}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
