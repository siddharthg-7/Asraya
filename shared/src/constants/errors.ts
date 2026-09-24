/**
 * @fileoverview Canonical Structured Error Taxonomy
 * Pramāṇa Protocol - Phase 1 Foundation
 */

export const ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  INVALID_PREDICATE: 'INVALID_PREDICATE',
  INVALID_CONSENT: 'INVALID_CONSENT',
  REGISTRY_LOOKUP_FAILED: 'REGISTRY_LOOKUP_FAILED',
  LICENCE_INVALID: 'LICENCE_INVALID',
  ATTRIBUTE_NOT_SUPPORTED: 'ATTRIBUTE_NOT_SUPPORTED',
  PROOF_NOT_SUPPORTED: 'PROOF_NOT_SUPPORTED',
  PROOF_VERIFICATION_FAILED: 'PROOF_VERIFICATION_FAILED',
  CREDENTIAL_INVALID: 'CREDENTIAL_INVALID',
  EXPIRED_REQUEST: 'EXPIRED_REQUEST',
  REPLAY_DETECTED: 'REPLAY_DETECTED',
  INVALID_REGISTRY_RECORD: 'INVALID_REGISTRY_RECORD',
  DATA_MINIMIZATION_VIOLATION: 'DATA_MINIMIZATION_VIOLATION',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  UNVERIFIED_FEATURE: 'UNVERIFIED_FEATURE',
  INTERNAL_PROTOCOL_ERROR: 'INTERNAL_PROTOCOL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ErrorDetails {
  readonly code: ErrorCode;
  readonly message: string;
  readonly safeDetails?: Readonly<Record<string, unknown>> | undefined;
  readonly timestamp: string;
}

export class PramanaError extends Error {
  public readonly code: ErrorCode;
  public readonly safeDetails?: Readonly<Record<string, unknown>> | undefined;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message: string,
    safeDetails?: Readonly<Record<string, unknown>> | undefined,
  ) {
    super(message);
    this.name = 'PramanaError';
    this.code = code;
    this.safeDetails = safeDetails;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      safeDetails: this.safeDetails,
      timestamp: this.timestamp,
    };
  }
}
