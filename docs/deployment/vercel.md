# Vercel Deployment & Full-Stack Architecture Guide — Pramāṇa Protocol

This guide explains how the **Frontend** and **Backend** are deployed on Vercel, how requests flow, and the production trade-offs between Serverless and Dedicated hosting.

---

## ⚡ Option 1: 100% Serverless on Vercel (Frontend + Backend on Vercel)

Pramāṇa is configured to run **both the Vite React frontend AND the Fastify backend directly on Vercel** out of the box with zero external infrastructure required.

### How It Works Under the Hood

```
Citizen Browser / Verifier UI
        │
        ├─── Static Assets (/) ──────► Vercel Global Edge CDN ──► frontend/dist/index.html
        │
        └─── API Calls (/api/v1/*, /health) ──► Vercel Serverless Function ──► api/index.ts (Fastify)
                                                                                  │
                                                                   ┌──────────────┴──────────────┐
                                                                   ▼                             ▼
                                                           BBS+ Verification            Groth16 zk-SNARK Engine
                                                          (Rust/WASM BLS12-381)       (circuits/build/predicate.zkey)
```

1. **Vercel Serverless Bridge ([api/index.ts](file:///c:/project-self-1/pramana/api/index.ts))**:
   - Wraps the Fastify application instance inside a Vercel Serverless Function (`@vercel/node`).
   - Reuses a warm Fastify server instance across invocations.
2. **Path Routing ([vercel.json](file:///c:/project-self-1/pramana/vercel.json))**:
   - `/health` ➔ Proxied to Serverless Function `api/index.ts`.
   - `/api/v1/:path*` ➔ Proxied to Serverless Function `api/index.ts`.
   - `/(.*)` ➔ Routed to `frontend/dist/index.html` (SPA routing).
3. **ZK Proving Key Packaging**:
   - `vercel.json` includes `includeFiles: "circuits/build/**"` with `maxDuration: 30`, ensuring `predicate.zkey` (43KB) is bundled directly into the serverless function environment.
4. **WASM BLS12-381 Support**:
   - Uses `@mattrglobal/bbs-signatures` compiled to WebAssembly, executing within Node.js without requiring native Linux C++ build tools.

### Deploy Steps

1. Go to [vercel.com/new](https://vercel.com/new) and import **`siddharthg-7/Asraya`**.
2. Vercel automatically detects [`vercel.json`](file:///c:/project-self-1/pramana/vercel.json):
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` _(repository root)_
   - **Build Command**: `pnpm run build:vercel`
   - **Output Directory**: `frontend/dist`
3. Click **Deploy**. Both the Frontend and the Backend API will be live on the same Vercel domain!

---

## 🚀 Option 2: Dedicated Backend + Vercel Frontend (Recommended for High Scale)

For enterprise production deployments requiring permanent in-memory nonce cache and persistent multi-region anti-replay protection:

```
┌─────────────────────────────────┐        Cross-Origin JSON       ┌─────────────────────────────────┐
│     Vercel Frontend (Edge)      │ ─────────────────────────────► │    Dedicated Backend (Node)     │
│  https://pramana.vercel.app     │                                │  https://api.yourdomain.com     │
│  (React 19 + Vite SPA)          │ ◄───────────────────────────── │  (Fastify + Stateful Memory)    │
└─────────────────────────────────┘           CORS: true           └─────────────────────────────────┘
```

### Why Use a Dedicated Backend for Production?

1. **Stateful Anti-Replay Defense**:
   - Pramāṇa’s [`InMemoryVerifierStorage`](file:///c:/project-self-1/pramana/backend/src/database/in-memory-storage.ts) stores one-time challenge nonces (120s TTL) and context-scoped nullifier hashes.
   - On serverless platforms (Vercel Lambdas), functions scale to zero or run on independent regional containers, meaning nonces are isolated to that lambda instance.
   - A dedicated long-running process (or Redis-backed storage) maintains the anti-replay cache globally.
2. **Instant Warm Proving**:
   - Eliminates cold starts completely. Proving and verification execute within sub-second latencies continuously.

### Deploying the Backend on Railway, Render, or Fly.io

1. **Deploy Backend**:
   - **Build Command**: `pnpm install && pnpm run circuits:setup && pnpm run build`
   - **Start Command**: `node backend/dist/server.js`
   - **Environment Variables**:
     - `PORT=3001`
     - `HOST=0.0.0.0`
     - `BBS_SIGNATURES_MODE=WASM`
2. **Link Vercel Frontend to Backend**:
   - In **Vercel Dashboard** ➔ Project Settings ➔ **Environment Variables**:
     - Set `VITE_BACKEND_URL=https://api.yourdomain.com` (your backend URL).
   - Re-deploy. The frontend API client automatically routes all requests to your dedicated backend.

---

## 🔒 Security & Anti-Hallucination Compliance

- **CORS Configuration**: [`backend/src/server.ts`](file:///c:/project-self-1/pramana/backend/src/server.ts) allows `origin: true`, enabling Vercel preview branch deployments (`https://*-your-team.vercel.app`) to interact securely with the API.
- **Data Minimization**: Neither the Vercel frontend nor the backend stores citizen PII. Proof verification returns boolean verdicts and audit receipts only.
