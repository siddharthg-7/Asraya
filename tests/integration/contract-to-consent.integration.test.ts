import { describe, it, expect } from 'vitest';
import { ContractBuilder } from '../../backend/src/protocol/contract-builder.js';
import { validateRequestContract } from '../../shared/src/index.js';
import { TemplateRenderer } from '../../frontend/src/lib/template-renderer.js';

describe('Integration Tests: Contract Formulation to Consent Prompt', () => {
  it('should formulate a valid contract and render a verified consent prompt', () => {
    // 1. Verifier builds contract
    const contract = ContractBuilder.build({
      verifierDid: 'did:pramana:verifier:fintech-01',
      verifierName: 'Fintech Corp',
      purpose: 'PURPOSE_AGE_VERIFICATION',
      context: 'loan-application-q3',
      predicates: [
        {
          attributeId: 'urn:pramana:attr:civil:age',
          operator: 'GTE',
          constant: 21,
        },
      ],
      ttlSeconds: 60,
    });

    // 2. Schema boundary validates contract
    const validated = validateRequestContract(contract);
    expect(validated.nonce.length).toBe(64);

    // 3. Citizen wallet renders template-bound consent prompt
    const template =
      '{{verifier_name}} is verifying that you meet the age requirement for {{purpose}}.';
    const rendered = TemplateRenderer.render(template, {
      verifier_name: validated.verifier.name,
      purpose: validated.purpose,
    });

    expect(rendered).toContain('Fintech Corp is verifying');
    expect(rendered).toContain('PURPOSE_AGE_VERIFICATION');
  });
});
