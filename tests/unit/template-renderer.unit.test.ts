import { describe, it, expect } from 'vitest';
import { TemplateRenderer } from '../../frontend/src/lib/template-renderer.js';

describe('Unit Tests: Template Consent Renderer', () => {
  it('should interpolate allowed parameters safely', () => {
    const template = '{{verifier_name}} asks for {{purpose}}.';
    const result = TemplateRenderer.render(template, {
      verifier_name: 'Metro Transit Auth',
      purpose: 'Discount Fare Eligibility',
    });
    expect(result).toBe('Metro Transit Auth asks for Discount Fare Eligibility.');
  });

  it('should escape malicious HTML characters to prevent XSS in wallet consent prompts', () => {
    const template = 'Message from {{verifier_name}}: {{prompt}}';
    const result = TemplateRenderer.render(template, {
      verifier_name: '<script>alert(1)</script>',
      prompt: 'Click "here" & confirm > today',
    });
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('&amp;');
    expect(result).toContain('&gt;');
  });
});
