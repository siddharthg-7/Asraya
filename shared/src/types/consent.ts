/**
 * @fileoverview Bounded Consent Model Specification
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { Predicate } from './predicates.js';

export interface TemplateBinding {
  readonly templateId: string;
  readonly templateVersion: string;
  readonly templateHash: string; // SHA-256 digest of canonical registry template
  readonly locale: string; // e.g., 'en-US', 'hi-IN'
  readonly renderedSummary: string; // Sanitized, template-interpolated prompt text
}

export interface CitizenAuthorization {
  readonly authorized: boolean;
  readonly method: 'BIOMETRIC_PASSKEY' | 'DEVICE_PASSCODE' | 'EXPLICIT_CONFIRMATION';
  readonly authorizedAt: string; // ISO 8601 UTC
}

export interface ConsentContract {
  readonly id: string; // UUIDv4
  readonly requestContractId: string;
  readonly verifierDid: string;
  readonly purpose: string;
  readonly predicates: readonly Predicate[];
  readonly context: string;
  readonly template: TemplateBinding;
  readonly authorization: CitizenAuthorization;
  readonly expiresAt: string; // ISO 8601 UTC
  readonly citizenSignature: string; // Cryptographic signature of holder key sealing consent
}
