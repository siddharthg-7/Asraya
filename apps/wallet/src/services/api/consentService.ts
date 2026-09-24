import { pramanaService } from '../mock/mockPramanaService';

export const consentService = {
  async approveConsent(
    requestId: string,
  ): Promise<{ status: 'GENERATING_PROOF'; requestId: string }> {
    return pramanaService.approveRequest(requestId);
  },

  async declineConsent(requestId: string): Promise<{ status: 'REJECTED'; requestId: string }> {
    return pramanaService.rejectRequest(requestId);
  },
};
