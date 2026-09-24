/**
 * @fileoverview Unit Tests: BBS Multi-Message Signatures & Selective Disclosure
 * Pramāṇa Protocol - Phase 5 Cryptographic Core
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { bbsService } from '../../backend/src/crypto/bbs-service.js';
import { issuerKeyManager } from '../../backend/src/crypto/issuer-key-manager.js';
import {
  MinimalClaimSet,
  HolderBindingCommitment,
  CANONICAL_ATTRIBUTES,
  PramanaError,
} from '../../shared/src/index.js';

describe('BBS Cryptographic Engine & Selective Disclosure Tests', () => {
  const issuerDid = 'did:pramana:issuer:transport-dept';
  let issuerPublicKeyBase64: string;

  beforeAll(async () => {
    await issuerKeyManager.initializeIssuerKeys();
    issuerPublicKeyBase64 = await issuerKeyManager.getPublicKeyBase64(issuerDid);
  });

  const sampleClaimSet: MinimalClaimSet = {
    schemaId: 'urn:pramana:schema:trans:permit:v1',
    issuerDid,
    subjectId: 'citizen-bob-synth-001',
    claims: {
      [CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]: 'ACTIVE',
      [CANONICAL_ATTRIBUTES.DISTRICT]: 'DISTRICT_42',
      [CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS]: 180000,
    },
    issuedAt: new Date().toISOString(),
  };

  const sampleBinding: HolderBindingCommitment = {
    holderPublicKeyHash: 'holder_pub_hash_1234567890abcdef',
    algorithm: 'BLS12-381-G1',
  };

  it('should successfully issue and sign a BBS credential', async () => {
    const cred = await bbsService.signCredential(issuerDid, sampleClaimSet, sampleBinding);

    expect(cred.metadata.schemaId).toBe(sampleClaimSet.schemaId);
    expect(cred.issuer.did).toBe(issuerDid);
    expect(cred.signature).toBeTypeOf('string');
    // Base64-encoded 112-byte BBS signature is ~152 characters
    expect(Buffer.from(cred.signature, 'base64').length).toBe(112);

    // Direct signature verification
    const sigValid = await bbsService.verifySignature(cred, issuerPublicKeyBase64);
    expect(sigValid).toBe(true);
  });

  it('should generate selective disclosure proof disclosing only requested attributes', async () => {
    const cred = await bbsService.signCredential(issuerDid, sampleClaimSet, sampleBinding);
    const nonce = 'request-nonce-01234567890123456789012345678901';

    // Disclose ONLY district and permit_status; blind trailing_12m_earnings!
    const revealedKeys = [
      CANONICAL_ATTRIBUTES.DISTRICT,
      CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS,
    ];

    const presentation = await bbsService.createPresentation(cred, revealedKeys, nonce);

    expect(presentation.tier).toBe('TIER_A_BBS');
    expect(presentation.revealedAttributes).toEqual({
      [CANONICAL_ATTRIBUTES.DISTRICT]: 'DISTRICT_42',
      [CANONICAL_ATTRIBUTES.COMMERCIAL_PERMIT_STATUS]: 'ACTIVE',
    });

    // PRIVACY VERIFICATION: Hidden earnings must NOT be in revealedAttributes
    expect(
      presentation.revealedAttributes[CANONICAL_ATTRIBUTES.TRAILING_12M_EARNINGS],
    ).toBeUndefined();
    expect(presentation.proofBytes).toBeTypeOf('string');

    // Cryptographic verification against issuer public key and challenge nonce
    const verified = await bbsService.verifyPresentation(
      presentation,
      issuerPublicKeyBase64,
      nonce,
    );
    expect(verified).toBe(true);
  });

  it('should reject presentation verification if challenge nonce is tampered', async () => {
    const cred = await bbsService.signCredential(issuerDid, sampleClaimSet, sampleBinding);
    const presentation = await bbsService.createPresentation(
      cred,
      [CANONICAL_ATTRIBUTES.DISTRICT],
      'correct-nonce-123456789012345678901234',
    );

    const verified = await bbsService.verifyPresentation(
      presentation,
      issuerPublicKeyBase64,
      'tampered-nonce-123456789012345678901234',
    );
    expect(verified).toBe(false);
  });

  it('should reject presentation verification if revealed attribute value was altered', async () => {
    const cred = await bbsService.signCredential(issuerDid, sampleClaimSet, sampleBinding);
    const nonce = 'request-nonce-123456789012345678901234';
    const presentation = await bbsService.createPresentation(
      cred,
      [CANONICAL_ATTRIBUTES.DISTRICT],
      nonce,
    );

    // Tamper with the revealed attribute value
    const tamperedPayload = {
      ...presentation,
      revealedAttributes: {
        [CANONICAL_ATTRIBUTES.DISTRICT]: 'FORGED_DISTRICT_99',
      },
    };

    const verified = await bbsService.verifyPresentation(
      tamperedPayload,
      issuerPublicKeyBase64,
      nonce,
    );
    expect(verified).toBe(false);
  });

  it('should reject presentation verification if proof bytes are corrupted', async () => {
    const cred = await bbsService.signCredential(issuerDid, sampleClaimSet, sampleBinding);
    const nonce = 'request-nonce-123456789012345678901234';
    const presentation = await bbsService.createPresentation(
      cred,
      [CANONICAL_ATTRIBUTES.DISTRICT],
      nonce,
    );

    // Corrupt proof bytes
    const proofBuf = Buffer.from(presentation.proofBytes, 'base64');
    proofBuf[10] ^= 0xff;
    const corruptedPayload = {
      ...presentation,
      proofBytes: proofBuf.toString('base64'),
    };

    const verified = await bbsService.verifyPresentation(
      corruptedPayload,
      issuerPublicKeyBase64,
      nonce,
    );
    expect(verified).toBe(false);
  });

  it('should reject presentation verification if verified against wrong issuer public key', async () => {
    const cred = await bbsService.signCredential(issuerDid, sampleClaimSet, sampleBinding);
    const nonce = 'request-nonce-123456789012345678901234';
    const presentation = await bbsService.createPresentation(
      cred,
      [CANONICAL_ATTRIBUTES.DISTRICT],
      nonce,
    );

    // Civil Dept public key instead of Transport Dept
    const wrongPublicKey = await issuerKeyManager.getPublicKeyBase64(
      'did:pramana:issuer:gov-civil-dept',
    );

    const verified = await bbsService.verifyPresentation(presentation, wrongPublicKey, nonce);
    expect(verified).toBe(false);
  });

  it('should reject signing with unauthorized schema for issuer', async () => {
    const invalidSchemaClaimSet: MinimalClaimSet = {
      ...sampleClaimSet,
      schemaId: 'urn:pramana:schema:unauthorized:secret:v1',
    };

    await expect(
      bbsService.signCredential(issuerDid, invalidSchemaClaimSet, sampleBinding),
    ).rejects.toThrow('not authorized to issue schema');
  });

  it('should reject signing empty claim set', async () => {
    const emptyClaimSet: MinimalClaimSet = {
      ...sampleClaimSet,
      claims: {},
    };

    await expect(
      bbsService.signCredential(issuerDid, emptyClaimSet, sampleBinding),
    ).rejects.toThrow('Cannot sign empty claim set');
  });
});
