/**
 * @fileoverview Tier A: BBS Multi-Message Signature & Selective Disclosure Engine
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 *
 * Implements BBS+ cryptographic credential signing, selective disclosure zero-knowledge
 * presentation generation, and verification over the BLS12-381 pairing-friendly curve.
 *
 * Anti-Hallucination & Security Invariants:
 * - Uses audited @mattrglobal/bbs-signatures (WASM/Rust over BLS12-381).
 * - Zero fake signatures or dummy proofs in production verification paths.
 * - Private key material NEVER leaves the issuer key manager.
 * - Selective disclosure blinding guarantees unrevealed attributes are mathematically unrecoverable.
 */

import { blsSign, blsVerify, blsCreateProof, blsVerifyProof } from '@mattrglobal/bbs-signatures';
import {
  MinimalClaimSet,
  VerifiableCredential,
  HolderBindingCommitment,
  BBSProofPayload,
  ERROR_CODES,
  PramanaError,
} from '@pramana/shared';
import { issuerKeyManager } from './issuer-key-manager.js';
import { trustRegistry } from '../registry/trust-registry.js';

export interface IBbsCredentialService {
  signCredential(
    issuerDid: string,
    claimSet: MinimalClaimSet,
    holderBinding: HolderBindingCommitment,
  ): Promise<VerifiableCredential>;
}

export interface IBbsPresentationService {
  createPresentation(
    credential: VerifiableCredential,
    revealedAttributeKeys: readonly string[],
    nonce: string,
  ): Promise<BBSProofPayload>;

  verifyPresentation(
    payload: BBSProofPayload,
    issuerPublicKeyBase64: string,
    nonce: string,
  ): Promise<boolean>;
}

export class BbsService implements IBbsCredentialService, IBbsPresentationService {
  /**
   * Encodes a dictionary of claims into a deterministically ordered array of messages.
   * Format for each message: `${attributeKey}:${attributeValue}`
   */
  encodeClaimsToMessages(claims: Readonly<Record<string, string | number | boolean>>): {
    sortedKeys: string[];
    messages: Uint8Array[];
  } {
    const sortedKeys = Object.keys(claims).sort();
    const messages = sortedKeys.map(
      (key) => new Uint8Array(Buffer.from(`${key}:${String(claims[key])}`, 'utf8')),
    );
    return { sortedKeys, messages };
  }

  /**
   * Signs a MinimalClaimSet with the issuer's BLS12-381 G2 private key.
   */
  async signCredential(
    issuerDid: string,
    claimSet: MinimalClaimSet,
    holderBinding: HolderBindingCommitment,
  ): Promise<VerifiableCredential> {
    // 1. Verify issuer authorization in Trust Registry
    const issuerRecord = await trustRegistry.getIssuer(issuerDid);
    if (!issuerRecord || !issuerRecord.active || issuerRecord.status !== 'ACTIVE') {
      throw new PramanaError(
        ERROR_CODES.ISSUER_NOT_FOUND,
        `Cannot issue credential: Issuer "${issuerDid}" is not registered or active`,
      );
    }

    // 2. Validate that schema is authorized for this issuer
    if (!issuerRecord.authorizedSchemas.includes(claimSet.schemaId)) {
      throw new PramanaError(
        ERROR_CODES.ATTRIBUTE_NOT_SUPPORTED,
        `Issuer "${issuerDid}" is not authorized to issue schema "${claimSet.schemaId}"`,
      );
    }

    // 3. Encode canonical claims into deterministically ordered messages
    const { messages } = this.encodeClaimsToMessages(claimSet.claims);
    if (messages.length === 0) {
      throw new PramanaError(ERROR_CODES.CLAIM_GENERATION_FAILED, 'Cannot sign empty claim set');
    }

    // 4. Retrieve issuer key pair (private key remains strictly issuer-side)
    const keyPair = await issuerKeyManager.getKeyPair(issuerDid);

    // 5. Compute BBS+ signature over message tuple
    let signatureBytes: Uint8Array;
    try {
      signatureBytes = await blsSign({
        keyPair,
        messages,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new PramanaError(
        ERROR_CODES.CLAIM_GENERATION_FAILED,
        `BBS cryptographic signing failed: ${msg}`,
      );
    }

    const signature = Buffer.from(signatureBytes).toString('base64');
    const checkpoint = await trustRegistry.getLatestCheckpoint();

    return {
      metadata: {
        id: `cred-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        schemaId: claimSet.schemaId,
        issuedAt: claimSet.issuedAt || new Date().toISOString(),
      },
      issuer: {
        did: issuerDid,
        name: issuerRecord.legalName,
        registryCheckpoint: checkpoint.merkleRoot,
      },
      holderBinding,
      claims: { ...claimSet.claims },
      signature,
    };
  }

  /**
   * Generates a zero-knowledge selective disclosure presentation.
   * Blinds all claims not explicitly listed in revealedAttributeKeys.
   */
  async createPresentation(
    credential: VerifiableCredential,
    revealedAttributeKeys: readonly string[],
    nonce: string,
  ): Promise<BBSProofPayload> {
    const { sortedKeys, messages } = this.encodeClaimsToMessages(credential.claims);

    // Map revealed attributes to their 0-based indices in the sorted messages tuple
    const revealedIndices = sortedKeys
      .map((k, idx) => (revealedAttributeKeys.includes(k) ? idx : -1))
      .filter((idx) => idx !== -1);

    // Filter revealed attributes dictionary (strictly excluding unrevealed attributes)
    const revealedAttributes: Record<string, string | number | boolean> = {};
    for (const key of sortedKeys) {
      if (revealedAttributeKeys.includes(key) && key in credential.claims) {
        revealedAttributes[key] = credential.claims[key]!;
      }
    }

    // Retrieve issuer public key
    const issuerRecord = await trustRegistry.getIssuer(credential.issuer.did);
    if (!issuerRecord) {
      throw new PramanaError(
        ERROR_CODES.ISSUER_NOT_FOUND,
        `Cannot verify presentation: Issuer "${credential.issuer.did}" not found in registry`,
      );
    }

    const publicKeyBytes = new Uint8Array(
      Buffer.from(issuerRecord.publicKeys.bbsG2PublicKey, 'base64'),
    );
    const signatureBytes = new Uint8Array(Buffer.from(credential.signature, 'base64'));
    const nonceBytes = new Uint8Array(Buffer.from(nonce, 'utf8'));

    let proofBytes: Uint8Array;
    try {
      proofBytes = await blsCreateProof({
        signature: signatureBytes,
        publicKey: publicKeyBytes,
        messages,
        nonce: nonceBytes,
        revealed: revealedIndices,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new PramanaError(
        ERROR_CODES.PROOF_VERIFICATION_FAILED,
        `BBS selective disclosure proof generation failed: ${msg}`,
      );
    }

    // Calculate blinded commitment identifier (hash of blinded attributes commitment)
    const blindedCommitment = Buffer.from(proofBytes.slice(0, 32)).toString('hex');

    return {
      tier: 'TIER_A_BBS',
      revealedAttributes,
      proofBytes: Buffer.from(proofBytes).toString('base64'),
      blindedCommitment,
    };
  }

  /**
   * Cryptographically verifies a BBS selective disclosure presentation.
   */
  async verifyPresentation(
    payload: BBSProofPayload,
    issuerPublicKeyBase64: string,
    nonce: string,
  ): Promise<boolean> {
    try {
      const publicKeyBytes = new Uint8Array(Buffer.from(issuerPublicKeyBase64, 'base64'));
      const proofBytes = new Uint8Array(Buffer.from(payload.proofBytes, 'base64'));
      const nonceBytes = new Uint8Array(Buffer.from(nonce, 'utf8'));

      // Reconstruct messages for the revealed attributes in the same sorted order
      const sortedRevealedKeys = Object.keys(payload.revealedAttributes).sort();
      const revealedMessages = sortedRevealedKeys.map(
        (key) =>
          new Uint8Array(Buffer.from(`${key}:${String(payload.revealedAttributes[key])}`, 'utf8')),
      );

      const result = await blsVerifyProof({
        publicKey: publicKeyBytes,
        proof: proofBytes,
        messages: revealedMessages,
        nonce: nonceBytes,
      });

      return result.verified;
    } catch (_err: unknown) {
      // Any malformed byte payload or curve point decompression failure -> false
      return false;
    }
  }

  /**
   * Directly verifies a full BBS signature (non-presentation).
   */
  async verifySignature(
    credential: VerifiableCredential,
    issuerPublicKeyBase64: string,
  ): Promise<boolean> {
    try {
      const publicKeyBytes = new Uint8Array(Buffer.from(issuerPublicKeyBase64, 'base64'));
      const signatureBytes = new Uint8Array(Buffer.from(credential.signature, 'base64'));
      const { messages } = this.encodeClaimsToMessages(credential.claims);

      const result = await blsVerify({
        publicKey: publicKeyBytes,
        messages,
        signature: signatureBytes,
      });

      return result.verified;
    } catch (_err: unknown) {
      return false;
    }
  }
}

export const bbsService = new BbsService();
