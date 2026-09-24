import { describe, it, expect } from 'vitest';
import { FIXTURE_NOTICE } from '../../packages/test-fixtures/src/index.js';

describe('Integration Test Infrastructure Harness', () => {
  it('should verify test fixtures notice is appropriately labeled as mock/demo only', () => {
    expect(FIXTURE_NOTICE).toContain('MOCK');
    expect(FIXTURE_NOTICE).toContain('DEMO ONLY');
    expect(FIXTURE_NOTICE).toContain('NOT PRODUCTION CRYPTO');
  });
});
