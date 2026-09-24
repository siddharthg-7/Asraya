/**
 * @fileoverview Cryptographic Verifier Service (Tier 4 Execution)
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 *
 * Implements strict cryptographic presentation verification, issuer trust anchoring,
 * and request/verifier binding validation.
 *
 * Architectural Invariants (Steps 21, 22, 23 & AGENTS.md):
 * - Separation of Concerns:
 *   POLICY AUTHORIZATION ≠ CITIZEN CONSENT ≠ CRYPTOGRAPHIC VALIDITY ≠ BUSINESS ELIGIBILITY
 * - Returns structured check results rather than collapsing into an opaque single boolean.
 * - Does not trust unverified issuer claims; resolves keys strictly via the Trust Registry.
 * - Strictly verifies request nonce and audience DID binding to prevent forwarding/replay.
 */

import { ProofEnvelope, RequestContract, Predicate, SinglePredicate } from '@pramana/shared';
import { trustRegistry } from '../registry/trust-registry.js';
import { bbsService } from '../crypto/bbs-service.js';
import { groth16Service } from '../crypto/groth16-service.js';
import { isTimestampValid } from '../utils/nonce.js';

export interface CryptographicCheckResults {
  readonly issuerStatus: 'TRUSTED' | 'UNTRUSTED';
  readonly issuerKeyValid: boolean;
  readonly bbsProofStatus: 'VALID' | 'INVALID' | 'SKIPPED';
  readonly groth16ProofStatus: 'VALID' | 'INVALID' | 'SKIPPED';
  readonly requestBindingStatus: 'VALID' | 'INVALID';
  readonly freshnessStatus: 'VALID' | 'INVALID';
}

export interface CryptographicVerificationResult {
  readonly isValid: boolean;
  readonly checks: CryptographicCheckResults;
  readonly revealedClaims: Readonly<Record<string, string | number | boolean>>;
  readonly errors: readonly string[];
}

export interface ICryptographicVerifierService {
  verifyPresentation(
    envelope: ProofEnvelope,
    requestContract: RequestContract,
  ): Promise<CryptographicVerificationResult>;
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

export class CryptographicVerifierService implements ICryptographicVerifierService {
  async verifyPresentation(
    envelope: ProofEnvelope,
    requestContract: RequestContract,
  ): Promise<CryptographicVerificationResult> {
    const errors: string[] = [];
    let revealedClaims: Record<string, string | number | boolean> = {};

    // ------------------------------------------------------------------------
    // 1. Temporal Freshness Check
    // ------------------------------------------------------------------------
    let freshnessStatus: 'VALID' | 'INVALID' = 'VALID';
    if (!isTimestampValid(envelope.createdAt)) {
      freshnessStatus = 'INVALID';
      errors.push('Proof envelope creation timestamp is expired or outside temporal tolerance');
    }

    // ------------------------------------------------------------------------
    // 2. Request & Audience Binding Check
    // ------------------------------------------------------------------------
    let requestBindingStatus: 'VALID' | 'INVALID' = 'VALID';
    if (envelope.contractId !== requestContract.id) {
      requestBindingStatus = 'INVALID';
      errors.push(
        `Request contract binding mismatch: expected ${requestContract.id}, got ${envelope.contractId}`,
      );
    }

    if (envelope.verifierDid !== requestContract.verifier.did) {
      requestBindingStatus = 'INVALID';
      errors.push(
        `Audience binding mismatch: envelope intended for ${envelope.verifierDid}, not ${requestContract.verifier.did}`,
      );
    }

    if (envelope.nonce !== requestContract.nonce) {
      requestBindingStatus = 'INVALID';
      errors.push('Request challenge nonce mismatch');
    }

    // ------------------------------------------------------------------------
    // 3. Issuer Trust Resolution via Trust Registry
    // ------------------------------------------------------------------------
    let issuerStatus: 'TRUSTED' | 'UNTRUSTED' = 'TRUSTED';
    let issuerKeyValid = false;
    let issuerPublicKeyBase64 = '';

    const issuerDid =
      envelope.issuerDid ||
      (await this.inferIssuerDidForSchema(
        envelope.schemaId || 'urn:pramana:schema:trans:permit:v1',
      ));

    const issuerRecord = await trustRegistry.getIssuer(issuerDid);
    if (!issuerRecord || !issuerRecord.active || issuerRecord.status !== 'ACTIVE') {
      issuerStatus = 'UNTRUSTED';
      errors.push(`Issuer "${issuerDid}" is not registered or active in Trust Registry`);
    } else {
      issuerPublicKeyBase64 = issuerRecord.publicKeys.bbsG2PublicKey;
      if (!issuerPublicKeyBase64 || issuerPublicKeyBase64.trim() === '') {
        issuerKeyValid = false;
        errors.push(`Issuer "${issuerDid}" has no registered BLS12-381 G2 public key`);
      } else {
        issuerKeyValid = true;
      }
    }

    // ------------------------------------------------------------------------
    // 4. Tier A: BBS Selective Disclosure Verification
    // ------------------------------------------------------------------------
    let bbsProofStatus: 'VALID' | 'INVALID' | 'SKIPPED' = 'SKIPPED';

    if (envelope.proofTier === 'TIER_A_BBS' || envelope.proofTier === 'TIER_HYBRID_BBS_GROTH16') {
      const bbsPayload =
        envelope.proofTier === 'TIER_A_BBS'
          ? (envelope.payload as import('@pramana/shared').BBSProofPayload)
          : (envelope.payload as import('@pramana/shared').CompositeProofPayload).bbs;

      if (!bbsPayload || bbsPayload.tier !== 'TIER_A_BBS') {
        bbsProofStatus = 'INVALID';
        errors.push('BBS proof payload is missing or malformed');
      } else if (!issuerKeyValid) {
        bbsProofStatus = 'INVALID';
        errors.push('Cannot verify BBS presentation: Issuer public key is unavailable');
      } else {
        const verified = await bbsService.verifyPresentation(
          bbsPayload,
          issuerPublicKeyBase64,
          envelope.nonce,
        );

        if (verified) {
          bbsProofStatus = 'VALID';
          revealedClaims = { ...bbsPayload.revealedAttributes };

          // Verify that revealed claims contain ONLY authorized attributes requested by the contract
          const allowedAttrs = new Set<string>();
          const contractReveal =
            requestContract.revealRequirements ??
            requestContract.disclose ??
            requestContract.disclosures ??
            [];
          for (const attr of contractReveal) {
            const def = await trustRegistry.getAttributeDefinition(attr);
            allowedAttrs.add(def?.id ?? attr);
          }

          for (const revealedKey of Object.keys(revealedClaims)) {
            const def = await trustRegistry.getAttributeDefinition(revealedKey);
            const canonicalKey = def?.id ?? revealedKey;
            if (!allowedAttrs.has(canonicalKey) && !allowedAttrs.has(revealedKey)) {
              errors.push(
                `Unauthorized attribute disclosure: "${revealedKey}" was not authorized by request contract`,
              );
            }
          }
        } else {
          bbsProofStatus = 'INVALID';
          errors.push(
            'BBS selective disclosure signature verification failed (tampered or invalid)',
          );
        }
      }
    }

    // ------------------------------------------------------------------------
    // 5. Tier B: Groth16 zk-SNARK Predicate Proof Verification
    // ------------------------------------------------------------------------
    let groth16ProofStatus: 'VALID' | 'INVALID' | 'SKIPPED' = 'SKIPPED';

    if (
      envelope.proofTier === 'TIER_B_GROTH16' ||
      envelope.proofTier === 'TIER_HYBRID_BBS_GROTH16'
    ) {
      const groth16Payload =
        envelope.proofTier === 'TIER_B_GROTH16'
          ? (envelope.payload as import('@pramana/shared').Groth16ProofPayload)
          : (envelope.payload as import('@pramana/shared').CompositeProofPayload).groth16;

      if (!groth16Payload || groth16Payload.tier !== 'TIER_B_GROTH16') {
        groth16ProofStatus = 'INVALID';
        errors.push('Groth16 proof payload is missing or malformed');
      } else {
        // Find expected predicate threshold from request contract
        const flatPreds = extractSinglePredicates(requestContract.predicates);
        const earningsPred = flatPreds.find((p) => p.attributeId.includes('earnings'));
        const expectedThreshold = earningsPred ? Number(earningsPred.constant) : 300000;

        try {
          const vKey = await groth16Service.getVerificationKey();
          const verified = await groth16Service.verifyPredicateProof(
            groth16Payload,
            vKey,
            expectedThreshold,
            envelope.nonce,
          );

          if (verified) {
            groth16ProofStatus = 'VALID';
          } else {
            groth16ProofStatus = 'INVALID';
            errors.push(
              'Groth16 predicate zk-SNARK verification failed (tampered proof or invalid inputs)',
            );
          }
        } catch (err: unknown) {
          groth16ProofStatus = 'INVALID';
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`Groth16 verification error: ${msg}`);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 6. Aggregate Cryptographic Verification Result
    // ------------------------------------------------------------------------
    const checks: CryptographicCheckResults = {
      issuerStatus,
      issuerKeyValid,
      bbsProofStatus,
      groth16ProofStatus,
      requestBindingStatus,
      freshnessStatus,
    };

    const isValid =
      freshnessStatus === 'VALID' &&
      requestBindingStatus === 'VALID' &&
      issuerStatus === 'TRUSTED' &&
      issuerKeyValid &&
      (bbsProofStatus === 'VALID' || bbsProofStatus === 'SKIPPED') &&
      (groth16ProofStatus === 'VALID' || groth16ProofStatus === 'SKIPPED') &&
      errors.length === 0;

    return {
      isValid,
      checks,
      revealedClaims,
      errors,
    };
  }

  private async inferIssuerDidForSchema(schemaId: string): Promise<string> {
    if (schemaId.includes('trans') || schemaId.includes('permit')) {
      return 'did:pramana:issuer:transport-dept';
    }
    if (schemaId.includes('bank') || schemaId.includes('fin')) {
      return 'did:pramana:issuer:bank-reg-authority';
    }
    return 'did:pramana:issuer:gov-civil-dept';
  }
}

export const cryptographicVerifierService = new CryptographicVerifierService();
