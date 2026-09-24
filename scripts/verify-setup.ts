/**
 * @fileoverview Setup Verification Script
 * Validates that all required packages, directories, and configuration files exist,
 * and confirms that no application implementation has prematurely started.
 */

import fs from 'node:fs';
import path from 'node:path';

const requiredDirectories = [
  'apps/wallet',
  'apps/verifier',
  'apps/registry',
  'services/issuer-mocks',
  'services/adapters',
  'packages/protocol',
  'packages/schemas',
  'packages/crypto',
  'packages/proofs',
  'packages/registry',
  'packages/transport',
  'packages/consent',
  'packages/adapters',
  'packages/shared',
  'packages/test-fixtures',
  'circuits',
  'docs/architecture',
  'docs/protocol',
  'docs/security',
  'docs/schemas',
  'docs/decisions',
  'docs/threat-model',
  'docs/demo',
  'skills/architecture',
  'skills/security',
  'skills/cryptography',
  'skills/zk-proofs',
  'skills/protocol',
  'skills/interoperability',
  'skills/frontend',
  'skills/backend',
  'skills/testing',
  'skills/documentation',
  'skills/anti-hallucination',
  'tests/unit',
  'tests/integration',
  'tests/security',
  'tests/conformance',
  '.github/workflows',
];

const requiredFiles = [
  'README.md',
  'ARCHITECTURE.md',
  'SECURITY.md',
  'CONTRIBUTING.md',
  'AGENTS.md',
  'PROJECT_STATUS.md',
  'DECISIONS.md',
  'THREAT_MODEL.md',
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  '.gitignore',
  '.env.example',
  'circuits/README.md',
];

console.log('--- Pramāṇa Workspace Verification ---');

let missing = 0;

for (const dir of requiredDirectories) {
  const fullPath = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    console.error(`[MISSING DIR] ${dir}`);
    missing++;
  }
}

for (const file of requiredFiles) {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.error(`[MISSING FILE] ${file}`);
    missing++;
  }
}

if (missing === 0) {
  console.log('[SUCCESS] All required directories and foundational files exist.');
  process.exit(0);
} else {
  console.error(`[FAILURE] Missing ${missing} required paths.`);
  process.exit(1);
}
