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

/**
 * Structured consent information presented to the citizen:
 * - WHO: Verifier identity and reputation
 * - WHAT: Specific predicates and requested disclosures
 * - NOT SHARED: Explicitly protected attributes kept completely private
 */
export interface ConsentSummary {
  readonly who: {
    readonly verifierDid: string;
    readonly verifierName: string;
  };
  readonly what: {
    readonly purpose: string;
    readonly predicates: readonly Predicate[];
    readonly disclosedAttributes: readonly string[];
  };
  readonly notShared: readonly string[];
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
  readonly summary?: ConsentSummary | undefined;
  readonly expiresAt: string; // ISO 8601 UTC
  readonly citizenSignature: string; // Cryptographic signature of holder key sealing consent
}

export type CitizenConsentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PolicyStatus = 'AUTHORIZED' | 'REJECTED';

export interface PolicyEvaluationResult {
  readonly status: PolicyStatus;
  readonly authorized: boolean;
  readonly verifierDid: string;
  readonly purpose: string;
  readonly permittedDisclosures: readonly string[];
  readonly permittedPredicates: readonly Predicate[];
  readonly violations?: readonly string[];
  readonly evaluatedAt: string;
}

export interface DisclosedAttributeView {
  readonly attributeId: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
}

export interface PredicateConditionView {
  readonly attributeId: string;
  readonly name: string;
  readonly operator: string;
  readonly humanReadableCondition: string;
}

/**
 * Structured, human-readable Consent Information delivered to the Citizen Wallet.
 * Distinguishes:
 * - WHO (verified legal identity from Trust Registry, not verifier display claim)
 * - WHAT (explicitly separating disclosed values from predicate-proven conditions)
 * - NOT SHARED (certified private attributes protected by minimization rules)
 *
 * Citizen consent status begins explicitly as PENDING.
 */
export interface ConsentInformation {
  readonly requestId: string;
  readonly requestNonce: string;
  readonly who: {
    readonly verifierDid: string;
    readonly verifierName: string; // Certified legal name from Trust Registry
    readonly role?: string | undefined;
    readonly legalEntity?: string | undefined;
  };
  readonly what: {
    readonly purpose: string;
    readonly purposeDescription?: string | undefined;
    readonly disclosedAttributes: readonly DisclosedAttributeView[];
    readonly predicates: readonly PredicateConditionView[];
  };
  readonly notShared: readonly string[];
  readonly template: TemplateBinding;
  readonly citizenConsentStatus: CitizenConsentStatus;
  readonly expiresAt: string;
}

export interface CitizenDecisionRecord {
  readonly requestId: string;
  readonly requestNonce: string;
  readonly decision: 'APPROVED' | 'REJECTED';
  readonly timestamp: string;
  readonly signature?: string | undefined; // Cryptographic signature deferred to Phase 5
}
