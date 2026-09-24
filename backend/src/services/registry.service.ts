/**
 * @fileoverview Registry Query Service
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { trustRegistry } from '../registry/trust-registry.js';
import { IssuerRecord, VerifierLicence, TemplateBundle, TrustCheckpoint } from '@pramana/shared';

export class RegistryService {
  async getIssuer(did: string): Promise<IssuerRecord | null> {
    return trustRegistry.getIssuer(did);
  }

  async getVerifierLicence(did: string): Promise<VerifierLicence | null> {
    return trustRegistry.getVerifierLicence(did);
  }

  async getTemplate(purposeCode: string, locale: string = 'en-US'): Promise<TemplateBundle | null> {
    return trustRegistry.getTemplate(purposeCode, locale);
  }

  async getLatestCheckpoint(): Promise<TrustCheckpoint> {
    return trustRegistry.getLatestCheckpoint();
  }
}

export const registryService = new RegistryService();
