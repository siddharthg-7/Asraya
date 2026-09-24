/**
 * @fileoverview Trust Registry Validation Schemas
 * Pramāṇa Protocol - Phase 2 Trust Registry & Institution Trust Layer
 *
 * Enforces strict boundary validation, anti-PII data minimization,
 * and rejection of private cryptographic material from registry records.
 */

import {
  IssuerKey,
  VerifierLicence,
  AttributeDef,
  BridgeDefinition,
  AdapterManifest,
  TemplateBundle,
  TrustCheckpoint,
} from '../types/registry.js';
import { ERROR_CODES, PramanaError } from '../constants/errors.js';

// ============================================================================
// SECURITY & DATA MINIMIZATION GUARDRAILS
// ============================================================================

const FORBIDDEN_PRIVATE_KEY_PATTERNS = [
  /private.*key/i,
  /secret.*key/i,
  /priv.*key/i,
  /^secret$/i,
  /^seed$/i,
  /^d$/i,
];

const FORBIDDEN_CITIZEN_DATA_KEYS = new Set([
  'income',
  'bankstatement',
  'bank_statement',
  'aadhaar',
  'pan',
  'phonenumber',
  'phone_number',
  'address',
  'fullname',
  'full_name',
  'passport',
  'salary',
  'ssn',
]);

/**
 * Checks an object recursively for private key indicators.
 * Rejects with a descriptive security error if detected.
 */
export function assertNoPrivateKeyMaterial(obj: unknown, path: string = ''): void {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string' && /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/i.test(obj)) {
      throw new PramanaError(
        ERROR_CODES.SECURITY_VIOLATION,
        `SECURITY_VIOLATION_PRIVATE_KEY_PROHIBITED: Private key PEM detected at ${path}`,
      );
    }
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => assertNoPrivateKeyMaterial(item, `${path}[${idx}]`));
    return;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    for (const pattern of FORBIDDEN_PRIVATE_KEY_PATTERNS) {
      if (pattern.test(key)) {
        throw new PramanaError(
          ERROR_CODES.SECURITY_VIOLATION,
          `SECURITY_VIOLATION_PRIVATE_KEY_PROHIBITED: Forbidden private key material "${key}" detected at ${path || 'root'}`,
        );
      }
    }
    assertNoPrivateKeyMaterial(value, path ? `${path}.${key}` : key);
  }
}

/**
 * Checks that a registry record does not contain citizen personal data or raw claims.
 * Differentiates between attribute definitions and citizen attribute values.
 */
export function assertNoCitizenData(obj: unknown, path: string = ''): void {
  if (obj === null || typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => assertNoCitizenData(item, `${path}[${idx}]`));
    return;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
    if (FORBIDDEN_CITIZEN_DATA_KEYS.has(normalizedKey)) {
      throw new PramanaError(
        ERROR_CODES.DATA_MINIMIZATION_VIOLATION,
        `DATA_MINIMIZATION_VIOLATION_PII_PROHIBITED: Citizen PII field "${key}" is prohibited in registry records at ${path || 'root'}`,
      );
    }
    assertNoCitizenData(value, path ? `${path}.${key}` : key);
  }
}

// ============================================================================
// 1. ISSUER KEY VALIDATOR
// ============================================================================

export function validateIssuerKey(input: unknown): IssuerKey {
  assertNoPrivateKeyMaterial(input);
  assertNoCitizenData(input);

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'IssuerKey record must be a non-null object',
    );
  }

  const rec = input as Record<string, unknown>;

  if (typeof rec['did'] !== 'string' || rec['did'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'IssuerKey did must be a non-empty string',
    );
  }

  if (typeof rec['legalName'] !== 'string' || rec['legalName'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'IssuerKey legalName must be a non-empty string',
    );
  }

  if (!Array.isArray(rec['authorizedSchemas']) || rec['authorizedSchemas'].length === 0) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'IssuerKey authorizedSchemas must be a non-empty array of schema strings',
    );
  }

  for (const schema of rec['authorizedSchemas']) {
    if (typeof schema !== 'string' || schema.trim() === '') {
      throw new PramanaError(
        ERROR_CODES.INVALID_REGISTRY_RECORD,
        'Authorized schema must be a non-empty string',
      );
    }
  }

  if (
    typeof rec['publicKeys'] !== 'object' ||
    rec['publicKeys'] === null ||
    Array.isArray(rec['publicKeys'])
  ) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'IssuerKey publicKeys must be an object',
    );
  }

  const keys = rec['publicKeys'] as Record<string, unknown>;
  if (typeof keys['bbsG2PublicKey'] !== 'string' || keys['bbsG2PublicKey'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'IssuerKey bbsG2PublicKey must be a non-empty string',
    );
  }

  if (
    rec['status'] !== undefined &&
    !['ACTIVE', 'SUSPENDED', 'REVOKED'].includes(rec['status'] as string)
  ) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      `Invalid IssuerKey status: ${String(rec['status'])}`,
    );
  }

  return {
    did: rec['did'] as string,
    issuerId: typeof rec['issuerId'] === 'string' ? rec['issuerId'] : (rec['did'] as string),
    legalName: rec['legalName'] as string,
    authorizedSchemas: rec['authorizedSchemas'] as string[],
    publicKeys: {
      bbsG2PublicKey: keys['bbsG2PublicKey'] as string,
      keyId: typeof keys['keyId'] === 'string' ? keys['keyId'] : undefined,
      revocationEndpoint:
        typeof keys['revocationEndpoint'] === 'string' ? keys['revocationEndpoint'] : undefined,
    },
    validUntil: typeof rec['validUntil'] === 'string' ? rec['validUntil'] : undefined,
    status: (rec['status'] as 'ACTIVE' | 'SUSPENDED' | 'REVOKED') || 'ACTIVE',
    active: rec['active'] !== false && rec['status'] !== 'SUSPENDED' && rec['status'] !== 'REVOKED',
  };
}

// ============================================================================
// 2. VERIFIER LICENCE VALIDATOR
// ============================================================================

export function validateVerifierLicence(input: unknown): VerifierLicence {
  assertNoPrivateKeyMaterial(input);
  assertNoCitizenData(input);

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'VerifierLicence record must be a non-null object',
    );
  }

  const rec = input as Record<string, unknown>;

  if (typeof rec['did'] !== 'string' || rec['did'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'VerifierLicence did must be a non-empty string',
    );
  }

  if (typeof rec['legalName'] !== 'string' || rec['legalName'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'VerifierLicence legalName must be a non-empty string',
    );
  }

  if (!Array.isArray(rec['permittedPurposes']) || rec['permittedPurposes'].length === 0) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'VerifierLicence permittedPurposes must be a non-empty array',
    );
  }

  if (!Array.isArray(rec['permittedPredicates'])) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'VerifierLicence permittedPredicates must be an array',
    );
  }

  if (typeof rec['maxRetentionPolicy'] !== 'string' || rec['maxRetentionPolicy'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'VerifierLicence maxRetentionPolicy must be a non-empty string',
    );
  }

  if (typeof rec['validUntil'] !== 'string' || isNaN(Date.parse(rec['validUntil']))) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'VerifierLicence validUntil must be a valid ISO 8601 date string',
    );
  }

  if (!['ACTIVE', 'SUSPENDED', 'REVOKED'].includes(rec['status'] as string)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      `Invalid VerifierLicence status: ${String(rec['status'])}`,
    );
  }

  return {
    did: rec['did'] as string,
    verifierId: typeof rec['verifierId'] === 'string' ? rec['verifierId'] : (rec['did'] as string),
    legalName: rec['legalName'] as string,
    permittedPurposes: rec['permittedPurposes'] as string[],
    permittedPredicates: rec['permittedPredicates'] as string[],
    permittedAttributes: Array.isArray(rec['permittedAttributes'])
      ? (rec['permittedAttributes'] as string[])
      : undefined,
    maxRetentionPolicy: rec['maxRetentionPolicy'] as string,
    validUntil: rec['validUntil'] as string,
    status: rec['status'] as 'ACTIVE' | 'SUSPENDED' | 'REVOKED',
    issuedAt: typeof rec['issuedAt'] === 'string' ? rec['issuedAt'] : undefined,
  };
}

// ============================================================================
// 3. ATTRIBUTE DEF VALIDATOR
// ============================================================================

export function validateAttributeDef(input: unknown): AttributeDef {
  assertNoPrivateKeyMaterial(input);
  assertNoCitizenData(input);

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'AttributeDef record must be a non-null object',
    );
  }

  const rec = input as Record<string, unknown>;

  if (typeof rec['id'] !== 'string' || rec['id'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'AttributeDef id must be a non-empty string',
    );
  }

  if (typeof rec['name'] !== 'string' || rec['name'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'AttributeDef name must be a non-empty string',
    );
  }

  const validCategories = ['civil', 'financial', 'transport', 'educational', 'custom'];
  if (!validCategories.includes(rec['category'] as string)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      `Invalid AttributeDef category: ${String(rec['category'])}`,
    );
  }

  const validDataTypes = ['string', 'number', 'boolean', 'date'];
  if (!validDataTypes.includes(rec['dataType'] as string)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      `Invalid AttributeDef dataType: ${String(rec['dataType'])}`,
    );
  }

  if (typeof rec['description'] !== 'string' || rec['description'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'AttributeDef description must be a non-empty string',
    );
  }

  if (typeof rec['schemaId'] !== 'string' || rec['schemaId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'AttributeDef schemaId must be a non-empty string',
    );
  }

  return {
    id: rec['id'] as string,
    name: rec['name'] as string,
    category: rec['category'] as AttributeDef['category'],
    dataType: rec['dataType'] as AttributeDef['dataType'],
    description: rec['description'] as string,
    schemaId: rec['schemaId'] as string,
    allowedValues: Array.isArray(rec['allowedValues'])
      ? (rec['allowedValues'] as (string | number)[])
      : undefined,
    unit: typeof rec['unit'] === 'string' ? rec['unit'] : undefined,
    version: typeof rec['version'] === 'string' ? rec['version'] : undefined,
  };
}

// ============================================================================
// 4. BRIDGE DEFINITION VALIDATOR
// ============================================================================

export function validateBridge(input: unknown): BridgeDefinition {
  assertNoPrivateKeyMaterial(input);
  assertNoCitizenData(input);

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'BridgeDefinition record must be a non-null object',
    );
  }

  const rec = input as Record<string, unknown>;

  if (typeof rec['bridgeId'] !== 'string' || rec['bridgeId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'BridgeDefinition bridgeId must be a non-empty string',
    );
  }

  if (typeof rec['sourceSystem'] !== 'string' || rec['sourceSystem'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'BridgeDefinition sourceSystem must be a non-empty string',
    );
  }

  if (typeof rec['sourceField'] !== 'string' || rec['sourceField'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'BridgeDefinition sourceField must be a non-empty string',
    );
  }

  if (
    typeof rec['canonicalAttributeId'] !== 'string' ||
    rec['canonicalAttributeId'].trim() === ''
  ) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'BridgeDefinition canonicalAttributeId must be a non-empty string',
    );
  }

  if (typeof rec['transformRule'] !== 'string' || rec['transformRule'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'BridgeDefinition transformRule must be a non-empty string',
    );
  }

  return {
    bridgeId: rec['bridgeId'] as string,
    name: typeof rec['name'] === 'string' ? rec['name'] : undefined,
    sourceSystem: rec['sourceSystem'] as string,
    sourceField: rec['sourceField'] as string,
    canonicalAttributeId: rec['canonicalAttributeId'] as string,
    transformRule: rec['transformRule'] as string,
    version: typeof rec['version'] === 'string' ? rec['version'] : undefined,
  };
}

// ============================================================================
// 5. ADAPTER MANIFEST VALIDATOR
// ============================================================================

export function validateAdapterManifest(input: unknown): AdapterManifest {
  assertNoPrivateKeyMaterial(input);
  assertNoCitizenData(input);

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'AdapterManifest record must be a non-null object',
    );
  }

  const rec = input as Record<string, unknown>;

  if (typeof rec['adapterId'] !== 'string' || rec['adapterId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'AdapterManifest adapterId must be a non-empty string',
    );
  }

  if (typeof rec['targetSchemaId'] !== 'string' || rec['targetSchemaId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'AdapterManifest targetSchemaId must be a non-empty string',
    );
  }

  if (typeof rec['version'] !== 'string' || rec['version'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'AdapterManifest version must be a non-empty string',
    );
  }

  if (!Array.isArray(rec['supportedAttributes']) || rec['supportedAttributes'].length === 0) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'AdapterManifest supportedAttributes must be a non-empty array',
    );
  }

  return {
    adapterId: rec['adapterId'] as string,
    name: typeof rec['name'] === 'string' ? rec['name'] : undefined,
    sourceFormat: (rec['sourceFormat'] as string) || 'REST_JSON',
    targetSchemaId: rec['targetSchemaId'] as string,
    version: rec['version'] as string,
    supportedAttributes: rec['supportedAttributes'] as string[],
    status: (rec['status'] as AdapterManifest['status']) || 'ACTIVE',
  };
}

// ============================================================================
// 6. TEMPLATE BUNDLE VALIDATOR
// ============================================================================

export function validateTemplateBundle(input: unknown): TemplateBundle {
  assertNoPrivateKeyMaterial(input);
  assertNoCitizenData(input);

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TemplateBundle record must be a non-null object',
    );
  }

  const rec = input as Record<string, unknown>;

  if (typeof rec['templateId'] !== 'string' || rec['templateId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TemplateBundle templateId must be a non-empty string',
    );
  }

  if (typeof rec['purposeCode'] !== 'string' || rec['purposeCode'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TemplateBundle purposeCode must be a non-empty string',
    );
  }

  if (typeof rec['locale'] !== 'string' || rec['locale'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TemplateBundle locale must be a non-empty string',
    );
  }

  if (typeof rec['templateText'] !== 'string' || rec['templateText'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TemplateBundle templateText must be a non-empty string',
    );
  }

  if (!Array.isArray(rec['parameterBindings'])) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TemplateBundle parameterBindings must be an array',
    );
  }

  if (typeof rec['version'] !== 'string' || rec['version'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TemplateBundle version must be a non-empty string',
    );
  }

  return {
    templateId: rec['templateId'] as string,
    purposeCode: rec['purposeCode'] as string,
    locale: rec['locale'] as string,
    templateText: rec['templateText'] as string,
    parameterBindings: rec['parameterBindings'] as string[],
    version: rec['version'] as string,
    who:
      typeof rec['who'] === 'object' && rec['who'] !== null
        ? (rec['who'] as TemplateBundle['who'])
        : undefined,
    what:
      typeof rec['what'] === 'object' && rec['what'] !== null
        ? (rec['what'] as TemplateBundle['what'])
        : undefined,
    notShared: Array.isArray(rec['notShared']) ? (rec['notShared'] as string[]) : undefined,
  };
}

// ============================================================================
// 7. TRUST CHECKPOINT VALIDATOR
// ============================================================================

export function validateTrustCheckpoint(input: unknown): TrustCheckpoint {
  assertNoPrivateKeyMaterial(input);
  assertNoCitizenData(input);

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TrustCheckpoint record must be a non-null object',
    );
  }

  const rec = input as Record<string, unknown>;

  if (typeof rec['epoch'] !== 'number' || rec['epoch'] < 0 || !Number.isInteger(rec['epoch'])) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TrustCheckpoint epoch must be a non-negative integer',
    );
  }

  if (typeof rec['merkleRoot'] !== 'string' || rec['merkleRoot'].length < 32) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TrustCheckpoint merkleRoot must be a string of at least 32 characters',
    );
  }

  if (typeof rec['publishedAt'] !== 'string' || isNaN(Date.parse(rec['publishedAt']))) {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TrustCheckpoint publishedAt must be a valid ISO 8601 date string',
    );
  }

  if (typeof rec['signature'] !== 'string' || rec['signature'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_REGISTRY_RECORD,
      'TrustCheckpoint signature must be a non-empty string',
    );
  }

  return {
    epoch: rec['epoch'] as number,
    merkleRoot: rec['merkleRoot'] as string,
    publishedAt: rec['publishedAt'] as string,
    signature: rec['signature'] as string,
    checkpointAuthority:
      typeof rec['checkpointAuthority'] === 'string' ? rec['checkpointAuthority'] : undefined,
  };
}
