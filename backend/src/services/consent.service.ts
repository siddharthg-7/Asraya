/**
 * @fileoverview Consent Protocol Service
 * Pramāṇa Protocol - Phase 4 Request -> Policy -> Consent
 *
 * Constructs human-readable, verifiable ConsentInformation (WHO, WHAT, NOT SHARED)
 * anchored in the Trust Registry and binds citizen consent decisions to request nonces.
 *
 * Source of truth: AGENTS.md, Phase 2 Trust Registry, Phase 4 Specification.
 */

import { createHash } from 'node:crypto';
import {
  RequestContract,
  ConsentInformation,
  CitizenDecisionRecord,
  TemplateBinding,
  DisclosedAttributeView,
  PredicateConditionView,
  Predicate,
  SinglePredicate,
  PramanaError,
  ERROR_CODES,
  validateConsentInformation,
  validateCitizenDecision,
} from '@pramana/shared';
import { trustRegistry, ITrustRegistry } from '../registry/trust-registry.js';
import { policyService, PolicyService } from './policy.service.js';

export class ConsentService {
  // Transient in-memory consent registry binding consent decisions to request nonces
  private readonly consentDecisions = new Map<string, CitizenDecisionRecord>();

  constructor(
    private readonly registry: ITrustRegistry = trustRegistry,
    private readonly policy: PolicyService = policyService,
  ) {}

  /**
   * Prepares structured ConsentInformation for the Citizen Wallet.
   *
   * Flow:
   * RequestContract -> Policy Evaluation -> Template Resolution -> Structured Consent (WHO, WHAT, NOT SHARED)
   * Citizen consent status is initialized strictly as PENDING.
   */
  async prepareConsent(
    contract: RequestContract,
    locale: string = 'en-US',
  ): Promise<ConsentInformation> {
    // 1. Evaluate policy against Trust Registry (ensures authorized purpose, attributes, predicates)
    const policyResult = await this.policy.evaluatePolicy(contract);
    if (!policyResult.authorized) {
      throw new PramanaError(
        ERROR_CODES.VERIFIER_NOT_AUTHORIZED,
        'Request is not policy-authorized by Trust Registry',
      );
    }

    // 2. Fetch authoritative Verifier Licence to anchor WHO (NEVER trust verifier display claim)
    const licence = await this.registry.getVerifierLicence(contract.verifier.did);
    if (!licence) {
      throw new PramanaError(
        ERROR_CODES.LICENCE_INVALID,
        `Verifier licence for "${contract.verifier.did}" not found in Trust Registry`,
      );
    }

    // 3. Resolve TemplateBundle from Trust Registry
    const template = await this.registry.getTemplate(contract.purpose, locale);
    if (!template) {
      throw new PramanaError(
        ERROR_CODES.CONSENT_TEMPLATE_NOT_FOUND,
        `Consent template for purpose "${contract.purpose}" (locale: "${locale}") not found in Trust Registry`,
        { purpose: contract.purpose, locale },
      );
    }

    // 4. Construct WHAT: Disclosed Attributes View (Clear-text revealed)
    const rawDisclosures =
      contract.revealRequirements ?? contract.disclose ?? contract.disclosures ?? [];
    const disclosedAttributes: DisclosedAttributeView[] = [];
    for (const attrId of rawDisclosures) {
      const def = await this.registry.getAttributeDefinition(attrId);
      if (def) {
        disclosedAttributes.push({
          attributeId: def.id,
          name: def.name,
          description: def.description,
          category: def.category,
        });
      }
    }

    // 5. Construct WHAT: Predicate Conditions View (Zero-knowledge proven without revealing raw values)
    const predicateViews: PredicateConditionView[] = [];
    for (const pred of contract.predicates) {
      await this.collectPredicateViews(pred, predicateViews);
    }

    // 6. Construct NOT SHARED: Explicitly protected attributes
    const notSharedList = this.constructNotSharedList(template.notShared, disclosedAttributes);

    // 7. Render Template prompt summary & bind template hash
    const disclosedSummary =
      disclosedAttributes.length > 0
        ? disclosedAttributes.map((d) => d.name).join(', ')
        : 'None (Zero-disclosure)';
    const predicatesSummary =
      predicateViews.length > 0
        ? predicateViews.map((p) => p.humanReadableCondition).join(' AND ')
        : 'None';

    const renderedSummary = this.renderTemplateText(template.templateText, {
      verifier_name: licence.legalName,
      purpose: contract.purpose,
      disclosed_attributes: disclosedSummary,
      predicates_summary: predicatesSummary,
    });

    const templateHash = createHash('sha256').update(template.templateText).digest('hex');

    const templateBinding: TemplateBinding = {
      templateId: template.templateId,
      templateVersion: template.version,
      templateHash,
      locale: template.locale,
      renderedSummary,
    };

    // 8. Assemble canonical ConsentInformation with citizenConsentStatus = 'PENDING'
    const consentInfo: ConsentInformation = {
      requestId: contract.id,
      requestNonce: contract.nonce,
      who: {
        verifierDid: licence.did,
        verifierName: licence.legalName, // Certified legal name from Trust Registry
        role: template.who?.role ?? 'Licensed Verifier',
        legalEntity: template.who?.legalEntity ?? licence.legalName,
      },
      what: {
        purpose: contract.purpose,
        purposeDescription: `Verification for ${contract.purpose}`,
        disclosedAttributes,
        predicates: predicateViews,
      },
      notShared: notSharedList,
      template: templateBinding,
      citizenConsentStatus: 'PENDING',
      expiresAt: contract.expiresAt,
    };

    return validateConsentInformation(consentInfo);
  }

  /**
   * Records a citizen's explicit consent decision ('APPROVED' | 'REJECTED') bound to request nonce.
   */
  async recordDecision(
    requestId: string,
    requestNonce: string,
    decision: 'APPROVED' | 'REJECTED',
    signature?: string,
  ): Promise<CitizenDecisionRecord> {
    const record = validateCitizenDecision({
      requestId,
      requestNonce,
      decision,
      timestamp: new Date().toISOString(),
      signature,
    });

    this.consentDecisions.set(`${requestId}:${requestNonce}`, record);
    return record;
  }

  /**
   * Look up recorded decision by requestId and nonce.
   */
  async getDecision(
    requestId: string,
    requestNonce: string,
  ): Promise<CitizenDecisionRecord | null> {
    return this.consentDecisions.get(`${requestId}:${requestNonce}`) ?? null;
  }

  private async collectPredicateViews(
    predicate: Predicate,
    accumulator: PredicateConditionView[],
  ): Promise<void> {
    if ('type' in predicate && predicate.type === 'COMPOUND_AND') {
      for (const sub of predicate.predicates) {
        await this.collectPredicateViews(sub, accumulator);
      }
      return;
    }

    const single = predicate as SinglePredicate;
    const attrId = single.attributeId;
    const def = await this.registry.getAttributeDefinition(attrId);
    const attrName = def?.name ?? attrId.split(':').pop() ?? attrId;
    const condition = this.formatHumanReadableCondition(attrName, single.operator, single.constant);

    accumulator.push({
      attributeId: attrId,
      name: attrName,
      operator: single.operator,
      humanReadableCondition: condition,
    });
  }

  private formatHumanReadableCondition(
    attrName: string,
    operator: string,
    constant: unknown,
  ): string {
    switch (operator) {
      case 'EQ':
        return `${attrName} must equal "${String(constant)}"`;
      case 'LT':
        return `${attrName} must be less than ${String(constant)}`;
      case 'LTE':
        return `${attrName} must be less than or equal to ${String(constant)}`;
      case 'IN':
        return `${attrName} must be one of [${Array.isArray(constant) ? constant.join(', ') : String(constant)}]`;
      default:
        return `${attrName} ${operator} ${String(constant)}`;
    }
  }

  private constructNotSharedList(
    templateNotShared?: readonly string[],
    disclosedAttributes: readonly DisclosedAttributeView[] = [],
  ): readonly string[] {
    const disclosedNames = new Set(disclosedAttributes.map((d) => d.name));
    const baseList = templateNotShared ?? [
      'bank_account_number',
      'transaction_history',
      'exact_earnings_amount',
      'residential_address',
      'national_identity_number',
    ];

    // Filter out anything that was actually disclosed
    return baseList.filter((item) => !disclosedNames.has(item));
  }

  private renderTemplateText(templateText: string, bindings: Record<string, string>): string {
    let result = templateText;
    for (const [key, value] of Object.entries(bindings)) {
      // Safe replacement without HTML injection
      const sanitized = value.replace(/[<>]/g, '');
      result = result.replaceAll(`{{${key}}}`, sanitized);
    }
    return result;
  }
}

export const consentService = new ConsentService();
