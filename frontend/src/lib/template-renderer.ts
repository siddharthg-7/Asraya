/**
 * @fileoverview Canonical Template Consent Renderer
 * Pramāṇa Protocol - Phase 1 Foundation
 *
 * Security: Replaces authorized template tokens with sanitized verifier values.
 * Never allows arbitrary verifier HTML execution.
 */

export class TemplateRenderer {
  static render(templateText: string, parameters: Record<string, string>): string {
    return templateText.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
      const value = parameters[key];
      return value !== undefined ? this.escape(value) : `[MISSING: ${key}]`;
    });
  }

  private static escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
