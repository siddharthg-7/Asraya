import { CredentialClaim } from '../../types/protocol';
import { pramanaService } from '../mock/mockPramanaService';

export const credentialService = {
  async getCredentials(): Promise<CredentialClaim[]> {
    return pramanaService.getCredentials();
  },

  async getCredentialById(id: string): Promise<CredentialClaim | null> {
    const creds = await pramanaService.getCredentials();
    return creds.find((c) => c.id === id) || null;
  },
};
