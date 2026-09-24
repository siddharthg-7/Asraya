/**
 * @fileoverview Phase 1 Setup Verification Script
 * Validates the full-stack architecture layout specified in phase1.md.
 */

import fs from 'node:fs';
import path from 'node:path';

const requiredDirectories = [
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/features/wallet',
  'frontend/src/features/consent',
  'frontend/src/features/verification',
  'frontend/src/features/receipts',
  'frontend/src/hooks',
  'frontend/src/services',
  'frontend/src/lib',
  'frontend/src/types',
  'backend/src/config',
  'backend/src/routes',
  'backend/src/controllers',
  'backend/src/services',
  'backend/src/domain',
  'backend/src/protocol',
  'backend/src/crypto',
  'backend/src/proofs',
  'backend/src/registry',
  'backend/src/issuers',
  'backend/src/adapters',
  'backend/src/transport',
  'backend/src/middleware',
  'backend/src/validation',
  'backend/src/database',
  'backend/src/utils',
  'backend/tests',
  'shared/src/types',
  'shared/src/schemas',
  'shared/src/constants',
  'circuits/src',
  'circuits/build',
  'mock-data/transport',
  'mock-data/bank',
  'mock-data/civil-registry',
  'docs/architecture',
  'docs/protocol',
  'docs/schemas',
  'docs/security',
  'docs/threat-model',
  'docs/decisions',
  'docs/demo',
  'skills/architecture',
  'skills/protocol',
  'skills/cryptography',
  'skills/zk-proofs',
  'skills/security',
  'skills/interoperability',
  'skills/frontend',
  'skills/backend',
  'skills/testing',
  'skills/documentation',
  'tests/unit',
  'tests/integration',
  'tests/security',
  'tests/conformance',
  '.github/workflows',
];

const requiredFiles = [
  'AGENTS.md',
  'README.md',
  'ARCHITECTURE.md',
  'SECURITY.md',
  'THREAT_MODEL.md',
  'PROJECT_STATUS.md',
  'DECISIONS.md',
  'CONTRIBUTING.md',
  '.env.example',
  '.gitignore',
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  'frontend/package.json',
  'frontend/vite.config.ts',
  'backend/package.json',
  'backend/src/server.ts',
  'shared/package.json',
  'circuits/README.md',
];

console.log('--- Pramāṇa Phase 1 Verification ---');

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
  console.log('[SUCCESS] All required Phase 1 directories and foundational files exist.');
  process.exit(0);
} else {
  console.error(`[FAILURE] Missing ${missing} required paths.`);
  process.exit(1);
}
