/**
 * @fileoverview Consent Schema and Boundary Validator
 * Pramāṇa Protocol - Phase 4 Request -> Policy -> Consent
 */

import {
  ConsentInformation,
  CitizenDecisionRecord,
  CitizenConsentStatus,
} from '../types/consent.js';
import { ERROR_CODES, PramanaError } from '../constants/errors.js';

const VALID_CONSENT_STATUSES: readonly CitizenConsentStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

export function validateConsentInformation(input: unknown): ConsentInformation {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation must be a non-null object',
    );
  }

  const record = input as Record<string, unknown>;

  if (typeof record['requestId'] !== 'string' || record['requestId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation requestId must be a non-empty string',
    );
  }

  if (typeof record['requestNonce'] !== 'string' || record['requestNonce'].length < 32) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation requestNonce must be at least 32 characters of hex entropy',
    );
  }

  if (typeof record['who'] !== 'object' || record['who'] === null) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation who section must be a non-null object',
    );
  }

  const who = record['who'] as Record<string, unknown>;
  if (typeof who['verifierDid'] !== 'string' || !who['verifierDid'].startsWith('did:')) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation who.verifierDid must be a valid DID string',
    );
  }

  if (typeof who['verifierName'] !== 'string' || who['verifierName'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation who.verifierName must be a non-empty string',
    );
  }

  if (typeof record['what'] !== 'object' || record['what'] === null) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation what section must be a non-null object',
    );
  }

  const what = record['what'] as Record<string, unknown>;
  if (typeof what['purpose'] !== 'string' || what['purpose'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation what.purpose must be a non-empty string',
    );
  }

  if (!Array.isArray(what['disclosedAttributes'])) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation what.disclosedAttributes must be an array',
    );
  }

  if (!Array.isArray(what['predicates'])) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation what.predicates must be an array',
    );
  }

  if (!Array.isArray(record['notShared'])) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation notShared must be an array of strings',
    );
  }

  if (typeof record['template'] !== 'object' || record['template'] === null) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation template must be a non-null object',
    );
  }

  const template = record['template'] as Record<string, unknown>;
  if (typeof template['templateId'] !== 'string' || template['templateId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation template.templateId must be a non-empty string',
    );
  }

  if (typeof template['templateHash'] !== 'string' || template['templateHash'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation template.templateHash must be a non-empty digest string',
    );
  }

  const status = record['citizenConsentStatus'] as CitizenConsentStatus;
  if (!VALID_CONSENT_STATUSES.includes(status)) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      `Invalid citizenConsentStatus: ${String(status)}, expected PENDING, APPROVED, or REJECTED`,
    );
  }

  if (typeof record['expiresAt'] !== 'string' || Number.isNaN(Date.parse(record['expiresAt']))) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'ConsentInformation expiresAt must be a valid ISO 8601 date string',
    );
  }

  return input as ConsentInformation;
}

export function validateCitizenDecision(input: unknown): CitizenDecisionRecord {
  if (typeof input !== 'object' || input === null) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'CitizenDecisionRecord must be a non-null object',
    );
  }

  const record = input as Record<string, unknown>;

  if (typeof record['requestId'] !== 'string' || record['requestId'].trim() === '') {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'CitizenDecisionRecord requestId must be a non-empty string',
    );
  }

  if (typeof record['requestNonce'] !== 'string' || record['requestNonce'].length < 32) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'CitizenDecisionRecord requestNonce must be at least 32 characters of hex entropy',
    );
  }

  const decision = record['decision'];
  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      `Citizen decision must be either APPROVED or REJECTED, received: ${String(decision)}`,
    );
  }

  const rawTimestamp = record['timestamp'] ?? new Date().toISOString();
  if (typeof rawTimestamp !== 'string' || Number.isNaN(Date.parse(rawTimestamp))) {
    throw new PramanaError(
      ERROR_CODES.INVALID_CONSENT,
      'CitizenDecisionRecord timestamp must be a valid ISO 8601 date string',
    );
  }

  return {
    requestId: record['requestId'],
    requestNonce: record['requestNonce'],
    decision,
    timestamp: new Date(Date.parse(rawTimestamp)).toISOString(),
    signature: typeof record['signature'] === 'string' ? record['signature'] : undefined,
  };
}
