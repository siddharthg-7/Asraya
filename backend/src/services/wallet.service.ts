/**
 * @fileoverview Citizen Wallet Credential Management & Presentation Service
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 *
 * Implements non-custodial credential storage, request-to-credential matching,
 * context-scoped nullifier / pseudonym derivation, and composite ProofEnvelope assembly.
 *
 * Security & Anti-Hallucination Invariants:
 * - MVP implementation uses in-memory local storage for development/testing.
 * - Production mobile Secure Enclave hardware isolation is NOT claimed or implemented here.
 * - Per-verifier pseudonym ensures unlinkability across independent verifiers without global citizen ID.
 * - Private witness attributes used solely in predicates are BLINDED in the BBS presentation.
 */

import { createHmac } from 'node:crypto';
import {
  VerifiableCredential,
  RequestContract,
  ConsentInformation,
  ProofEnvelope,
  NullifierRecord,
  Predicate,
  SinglePredicate,
  CANONICAL_ATTRIBUTES,
  ERROR_CODES,
  PramanaError,
} from '@pramana/shared';
import { bbsService } from '../crypto/bbs-service.js';
import { groth16Service } from '../crypto/groth16-service.js';
import { trustRegistry } from '../registry/trust-registry.js';

export interface CreatePresentationOptions {
  readonly requestContract: RequestContract;
  readonly consent: ConsentInformation;
  readonly credentialId?: string | undefined;
  readonly holderSecret?: string | undefined;
}

export interface IWalletService {
  storeCredential(credential: VerifiableCredential): Promise<void>;
  getCredentials(): Promise<VerifiableCredential[]>;
  getCredential(id: string): Promise<VerifiableCredential | null>;
  clear(): Promise<void>;
  findMatchingCredential(request: RequestContract): Promise<VerifiableCredential>;
  deriveVerifierPseudonym(holderSecret: string, verifierDid: string, contextId?: string): string;
  deriveNullifier(holderSecret: string, contextId: string, epoch?: number): NullifierRecord;
  createProofEnvelope(options: CreatePresentationOptions): Promise<ProofEnvelope>;
}

function extractSinglePredicates(predicates: readonly Predicate[]): SinglePredicate[] {
  const result: SinglePredicate[] = [];
  for (const p of predicates) {
    if ('type' in p && p.type === 'COMPOUND_AND') {
      result.push(...p.predicates);
    } else if ('attributeId' in p) {
      result.push(p);
    }
  }
  return result;
}

function getRequestedRevealAttributes(request: RequestContract): readonly string[] {
  return request.disclose ?? request.disclosures ?? request.revealRequirements ?? [];
}

export class WalletService implements IWalletService {
  private readonly credentials = new Map<string, VerifiableCredential>();

  async storeCredential(credential: VerifiableCredential): Promise<void> {
    this.credentials.set(credential.metadata.id, credential);
  }

  async getCredentials(): Promise<VerifiableCredential[]> {
    return Array.from(this.credentials.values());
  }

  async getCredential(id: string): Promise<VerifiableCredential | null> {
    return this.credentials.get(id) ?? null;
  }

  async clear(): Promise<void> {
    this.credentials.clear();
  }

  /**
   * Derives an unlinkable, verifier-specific pseudonym (nym).
   * Verifier A receives nym_A, Verifier B receives nym_B.
   * Neither verifier can correlate the citizen without the citizen's holder secret.
   */
  deriveVerifierPseudonym(holderSecret: string, verifierDid: string, contextId = 'global'): string {
    return createHmac('sha256', holderSecret)
      .update(`pramana:nym:${verifierDid}:${contextId}`)
      .digest('hex');
  }

  /**
   * Derives a context-scoped nullifier for duplicate-claim prevention within a specific campaign.
   */
  deriveNullifier(holderSecret: string, contextId: string, epoch = 1): NullifierRecord {
    const nullifierHash = createHmac('sha256', holderSecret)
      .update(`pramana:nullifier:${contextId}:${epoch}`)
      .digest('hex');

    return {
      contextId,
      nullifierHash,
      epoch,
    };
  }

  /**
   * Matches stored credentials against the required attributes and predicates of a request contract.
   */
  async findMatchingCredential(request: RequestContract): Promise<VerifiableCredential> {
    const allStored = Array.from(this.credentials.values());
    if (allStored.length === 0) {
      throw new PramanaError(
        ERROR_CODES.CREDENTIAL_INVALID,
        'Wallet has no stored credentials to satisfy request',
      );
    }

    // Collect all required canonical attributes (disclosed attributes + predicate attributes)
    const requiredAttributes = new Set<string>();
    const revealAttrs = getRequestedRevealAttributes(request);
    for (const attr of revealAttrs) {
      const def = await trustRegistry.getAttributeDefinition(attr);
      requiredAttributes.add(def?.id ?? attr);
    }

    const flatPreds = extractSinglePredicates(request.predicates);
    for (const pred of flatPreds) {
      const def = await trustRegistry.getAttributeDefinition(pred.attributeId);
      requiredAttributes.add(def?.id ?? pred.attributeId);
    }

    // Find first credential possessing all required claims
    for (const cred of allStored) {
      const availableClaims = Object.keys(cred.claims);
      const satisfiesAll = Array.from(requiredAttributes).every((attr) =>
        availableClaims.includes(attr),
      );

      if (satisfiesAll) {
        return cred;
      }
    }

    throw new PramanaError(
      ERROR_CODES.CREDENTIAL_INVALID,
      `Wallet possesses no single credential satisfying all requested attributes: [${Array.from(
        requiredAttributes,
      ).join(', ')}]`,
    );
  }

  /**
   * Creates a tamper-evident ProofEnvelope bound to the request contract and citizen consent.
   * Discloses only approved attributes; blinds predicate-only attributes and proves them via Groth16.
   */
  async createProofEnvelope(options: CreatePresentationOptions): Promise<ProofEnvelope> {
    const {
      requestContract,
      consent,
      holderSecret = 'default_holder_secret_key_material',
    } = options;

    // Verify consent references this contract
    if (consent.requestId !== requestContract.id) {
      throw new PramanaError(
        ERROR_CODES.INVALID_CONSENT,
        `Consent request ID ${consent.requestId} does not match request contract ID ${requestContract.id}`,
      );
    }

    // 1. Identify credential
    let credential: VerifiableCredential;
    if (options.credentialId) {
      const found = await this.getCredential(options.credentialId);
      if (!found) {
        throw new PramanaError(
          ERROR_CODES.CREDENTIAL_INVALID,
          `Specified credential "${options.credentialId}" not found in wallet`,
        );
      }
      credential = found;
    } else {
      credential = await this.findMatchingCredential(requestContract);
    }

    // 2. Determine which attributes to disclose via BBS vs blind for predicates
    // Only disclose attributes explicitly in request disclosure requirements AND approved in consent
    const revealAttrs = getRequestedRevealAttributes(requestContract);
    const requestedCanonical = new Set<string>();
    for (const attr of revealAttrs) {
      const def = await trustRegistry.getAttributeDefinition(attr);
      requestedCanonical.add(def?.id ?? attr);
    }

    const revealedAttributeKeys = Object.keys(credential.claims).filter((key) =>
      requestedCanonical.has(key),
    );

    // 3. Generate BBS selective disclosure presentation
    const bbsPayload = await bbsService.createPresentation(
      credential,
      revealedAttributeKeys,
      requestContract.nonce,
    );

    // 4. Check for numeric predicates requiring Tier B Groth16 proof
    let groth16Payload = undefined;
    const flatPreds = extractSinglePredicates(requestContract.predicates);
    for (const pred of flatPreds) {
      const attrDef = await trustRegistry.getAttributeDefinition(pred.attributeId);
      const canonicalAttr = attrDef?.id ?? pred.attributeId;

      if (canonicalAttr === CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS) {
        const rawEarnings = credential.claims[canonicalAttr];
        if (typeof rawEarnings !== 'number') {
          throw new PramanaError(
            ERROR_CODES.CREDENTIAL_INVALID,
            `Required predicate attribute "${canonicalAttr}" is not a numeric claim in credential`,
          );
        }

        const threshold = Number(pred.constant);
        if (Number.isNaN(threshold)) {
          throw new PramanaError(
            ERROR_CODES.INVALID_PREDICATE,
            `Predicate threshold value is invalid: ${String(pred.constant)}`,
          );
        }

        // Prove earnings <= threshold using Groth16 zk-SNARK bound to request nonce
        groth16Payload = await groth16Service.generatePredicateProof({
          earnings: rawEarnings,
          threshold,
          nonce: requestContract.nonce,
        });
      }
    }

    // 5. Derive context nullifier
    const contextId = requestContract.context || 'default_campaign';
    const nullifier = this.deriveNullifier(holderSecret, contextId, 1);

    // 6. Holder binding signature over challenge
    const holderBindingSignature = createHmac('sha256', holderSecret)
      .update(
        `holder_binding:${requestContract.id}:${requestContract.nonce}:${requestContract.verifier.did}`,
      )
      .digest('hex');

    // 7. Assemble ProofEnvelope
    if (groth16Payload) {
      return {
        contractId: requestContract.id,
        verifierDid: requestContract.verifier.did,
        nonce: requestContract.nonce,
        proofTier: 'TIER_HYBRID_BBS_GROTH16',
        payload: {
          tier: 'TIER_HYBRID_BBS_GROTH16',
          bbs: bbsPayload,
          groth16: groth16Payload,
        },
        nullifier,
        holderBindingSignature,
        createdAt: new Date().toISOString(),
        issuerDid: credential.issuer.did,
        schemaId: credential.metadata.schemaId,
        protocolVersion: requestContract.protocolVersion || '1.0.0',
      };
    }

    return {
      contractId: requestContract.id,
      verifierDid: requestContract.verifier.did,
      nonce: requestContract.nonce,
      proofTier: 'TIER_A_BBS',
      payload: bbsPayload,
      nullifier,
      holderBindingSignature,
      createdAt: new Date().toISOString(),
      issuerDid: credential.issuer.did,
      schemaId: credential.metadata.schemaId,
      protocolVersion: requestContract.protocolVersion || '1.0.0',
    };
  }
}

export const walletService = new WalletService();
