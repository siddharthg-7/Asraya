import { describe, it, expect } from 'vitest';
import { PROTOCOL_VERSION } from '../../packages/protocol/src/index.js';

describe('Conformance Test Infrastructure Harness', () => {
  it('should verify protocol version is defined according to draft specification', () => {
    expect(PROTOCOL_VERSION).toBe('1.0.0-draft');
  });
});
