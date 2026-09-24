import { AuditReceipt, VerifierAuditRecord } from '../../types/protocol';
import { pramanaService } from '../mock/mockPramanaService';

export const receiptService = {
  async getReceipts(): Promise<AuditReceipt[]> {
    return pramanaService.getReceipts();
  },

  async getReceiptById(id: string): Promise<AuditReceipt | null> {
    const receipts = await pramanaService.getReceipts();
    return receipts.find((r) => r.receiptId === id) || null;
  },

  async getVerifierAuditLogs(): Promise<VerifierAuditRecord[]> {
    return pramanaService.getVerifierAuditLogs();
  },
};
