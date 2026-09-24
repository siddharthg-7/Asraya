/**
 * @fileoverview Schema Mediation Adapter & Bridge Resolution Engine
 * Pramāṇa Protocol - Phase 3 Schema Mediation
 *
 * Resolves the appropriate source adapter and bridge transformation metadata
 * from the Trust Registry for any requested canonical attribute.
 */

import { trustRegistry } from '../registry/trust-registry.js';
import { ISourceAdapter } from './adapter-interface.js';
import { TransportSqlAdapter } from './sql-adapter.js';
import { Camt053BankAdapter } from './camt053-adapter.js';
import { MunicipalRestAdapter } from './rest-adapter.js';
import { CanonicalAttributeValue, PramanaError, ERROR_CODES } from '@pramana/shared';

export class AdapterResolver {
  private readonly adapters = new Map<string, ISourceAdapter>();

  constructor() {
    const sqlAdapter = new TransportSqlAdapter();
    const bankAdapter = new Camt053BankAdapter();
    const restAdapter = new MunicipalRestAdapter();

    this.registerAdapterInstance(sqlAdapter);
    this.adapters.set('adapter:transport:rest-json', sqlAdapter);

    this.registerAdapterInstance(bankAdapter);

    this.registerAdapterInstance(restAdapter);
    this.adapters.set('adapter:civil:sql-relational', restAdapter);
    this.adapters.set('adapter:civil:rest-json', restAdapter);
  }

  public registerAdapterInstance(adapter: ISourceAdapter): void {
    this.adapters.set(adapter.adapterId, adapter);
  }

  public getAdapterInstance(adapterId: string): ISourceAdapter | undefined {
    return this.adapters.get(adapterId);
  }

  /**
   * Resolves the adapter instance and verifies bridge metadata in the Trust Registry
   * for a requested canonical attribute.
   */
  async resolveForAttribute(
    attributeId: string,
    preferredAdapterId?: string,
  ): Promise<{
    adapter: ISourceAdapter;
    bridgeId: string;
    manifestId: string;
  }> {
    // 1. Check attribute existence in Trust Registry
    const attrDef = await trustRegistry.getAttributeDefinition(attributeId);
    if (!attrDef) {
      throw new PramanaError(
        ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED,
        `Attribute "${attributeId}" is not registered in the Trust Registry`,
      );
    }

    // 2. Resolve AdapterManifest from Trust Registry
    const manifests = await trustRegistry.getAdaptersForAttribute(attrDef.id);
    let manifest = manifests && manifests.length > 0 ? manifests[0] : undefined;
    if (preferredAdapterId && manifests) {
      const preferred = manifests.find((m) => m.adapterId === preferredAdapterId);
      if (preferred) {
        manifest = preferred;
      }
    }
    if (!manifest) {
      throw new PramanaError(
        ERROR_CODES.ADAPTER_NOT_FOUND,
        `No AdapterManifest registered in Trust Registry for attribute "${attrDef.id}"`,
      );
    }

    // 3. Resolve BridgeDefinition from Trust Registry
    const bridges = await trustRegistry.getBridgesForAttribute(attrDef.id);
    const bridge = bridges && bridges.length > 0 ? bridges[0] : undefined;
    if (!bridge) {
      throw new PramanaError(
        ERROR_CODES.BRIDGE_NOT_FOUND,
        `No BridgeDefinition registered in Trust Registry for attribute "${attrDef.id}"`,
      );
    }

    // 4. Resolve local executable adapter instance
    const adapterInstance = this.adapters.get(manifest.adapterId);
    if (!adapterInstance) {
      throw new PramanaError(
        ERROR_CODES.ADAPTER_NOT_FOUND,
        `Adapter executable "${manifest.adapterId}" not loaded in runtime`,
      );
    }

    return {
      adapter: adapterInstance,
      bridgeId: bridge.bridgeId,
      manifestId: manifest.adapterId,
    };
  }

  /**
   * Adapts a raw institutional source record into a verified canonical attribute value
   */
  async adaptAttribute(
    attributeId: string,
    sourceRecord: unknown,
    preferredAdapterId?: string,
  ): Promise<CanonicalAttributeValue> {
    const { adapter } = await this.resolveForAttribute(attributeId, preferredAdapterId);
    const canonicalAttrs = await adapter.adapt(sourceRecord);
    const targetAttr = canonicalAttrs.find((a) => a.attributeId === attributeId);

    if (!targetAttr) {
      throw new PramanaError(
        ERROR_CODES.TRANSFORMATION_FAILED,
        `Adapter "${adapter.adapterId}" failed to produce requested attribute "${attributeId}"`,
      );
    }

    return targetAttr;
  }
}

export const adapterResolver = new AdapterResolver();
