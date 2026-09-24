/**
 * @fileoverview Registry Query Service
 * Pramāṇa Protocol - Phase 2 Trust Registry & Institution Trust Layer
 */

import { trustRegistry, checkpointVerifier } from '../registry/trust-registry.js';
import {
  IssuerKey,
  VerifierLicence,
  AttributeDefinition,
  AttributeCategory,
  BridgeDefinition,
  AdapterManifest,
  TemplateBundle,
  TrustCheckpoint,
} from '@pramana/shared';

export class RegistryService {
  async getIssuer(didOrId: string): Promise<IssuerKey | null> {
    return trustRegistry.getIssuer(didOrId);
  }

  async getVerifierLicence(didOrId: string): Promise<VerifierLicence | null> {
    return trustRegistry.getVerifierLicence(didOrId);
  }

  async getAttributeDefinition(idOrAlias: string): Promise<AttributeDefinition | null> {
    return trustRegistry.getAttributeDefinition(idOrAlias);
  }

  async listAttributes(category?: AttributeCategory): Promise<AttributeDefinition[]> {
    return trustRegistry.listAttributes(category);
  }

  async getBridge(bridgeId: string): Promise<BridgeDefinition | null> {
    return trustRegistry.getBridge(bridgeId);
  }

  async getBridgesForAttribute(canonicalAttributeId: string): Promise<BridgeDefinition[]> {
    return trustRegistry.getBridgesForAttribute(canonicalAttributeId);
  }

  async getAdapter(adapterId: string): Promise<AdapterManifest | null> {
    return trustRegistry.getAdapter(adapterId);
  }

  async getAdaptersForAttribute(canonicalAttributeId: string): Promise<AdapterManifest[]> {
    return trustRegistry.getAdaptersForAttribute(canonicalAttributeId);
  }

  async getTemplate(purposeCode: string, locale: string = 'en-US'): Promise<TemplateBundle | null> {
    return trustRegistry.getTemplate(purposeCode, locale);
  }

  async getLatestCheckpoint(): Promise<TrustCheckpoint> {
    return trustRegistry.getLatestCheckpoint();
  }

  async verifyCheckpoint(checkpoint: TrustCheckpoint): Promise<boolean> {
    return checkpointVerifier.verifyCheckpoint(checkpoint);
  }
}

export const registryService = new RegistryService();
