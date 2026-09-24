import type { VerificationRequest, BoundedPredicate } from '../../types/protocol.ts';
import { pramanaService } from '../mock/mockPramanaService.ts';

export const requestService = {
  async getPendingRequests(): Promise<VerificationRequest[]> {
    return pramanaService.getPendingRequests();
  },

  async getRequestById(id: string): Promise<VerificationRequest | null> {
    const requests = await pramanaService.getPendingRequests();
    return requests.find((r) => r.id === id) || null;
  },

  async createRequest(params: {
    verifierName: string;
    purpose: string;
    purposeCode: string;
    predicates: Omit<BoundedPredicate, 'id'>[];
  }): Promise<VerificationRequest> {
    return pramanaService.createVerificationRequest(params);
  },
};
