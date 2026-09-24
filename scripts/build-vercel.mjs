/**
 * @fileoverview Vercel Production Build Script
 * Builds circuit artifacts, monorepo types, and the redesigned UI in apps/wallet,
 * syncing the output to both apps/wallet/dist and frontend/dist for universal deployment.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== PRAMĀṆA VERCEL BUILD ===');

// 1. Generate circuit artifacts
console.log('[1/4] Setting up circuit artifacts...');
execSync('pnpm run circuits:setup', { stdio: 'inherit' });

// 2. Compile monorepo TypeScript types
console.log('[2/4] Compiling TypeScript types (pnpm exec tsc -b)...');
execSync('pnpm exec tsc -b', { stdio: 'inherit' });

// 3. Build the redesigned frontend (apps/wallet)
console.log('[3/4] Building redesigned frontend (apps/wallet)...');
execSync('pnpm --filter @pramana/wallet run build', { stdio: 'inherit' });

// 4. Sync built bundle to frontend/dist for universal Vercel directory compatibility
console.log('[4/4] Syncing build output for Vercel...');
const walletDist = path.resolve('apps/wallet/dist');
const frontendDist = path.resolve('frontend/dist');
if (fs.existsSync(walletDist)) {
  fs.mkdirSync(frontendDist, { recursive: true });
  fs.cpSync(walletDist, frontendDist, { recursive: true, force: true });
}

console.log('[SUCCESS] Vercel build complete! Output ready in apps/wallet/dist and frontend/dist');
