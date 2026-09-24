# Vercel Deployment Guide — Pramāṇa Protocol Frontend

Deploy the Pramāṇa privacy-preserving proof verification frontend on Vercel in less than 2 minutes.

---

## ⚡ Option 1: Fast Deploy via Vercel Dashboard (Recommended)

1. Open [vercel.com/new](https://vercel.com/new).
2. Import the Git repository: **`siddharthg-7/Asraya`**.
3. In **Configure Project**, the repository's root [`vercel.json`](file:///c:/project-self-1/pramana/vercel.json) automatically pre-configures everything. Verify the following fields:

| Setting              | Value                                                         |
| :------------------- | :------------------------------------------------------------ |
| **Framework Preset** | `Vite`                                                        |
| **Root Directory**   | `./` _(leave default repository root)_                        |
| **Build Command**    | `pnpm run build:vercel` _(or auto-detected from vercel.json)_ |
| **Output Directory** | `frontend/dist`                                               |
| **Install Command**  | `pnpm install`                                                |

4. **Environment Variables** (Optional):
   - `VITE_BACKEND_URL`: URL of your deployed Pramāṇa backend (e.g. `https://api.yourdomain.com`).  
     _(If omitted, defaults to relative requests for reverse-proxy setups, or `http://localhost:3001` in local dev)._
5. Click **Deploy**.

---

## 💻 Option 2: Deploy via Vercel CLI

From your terminal at the repository root:

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Preview deployment
vercel

# 3. Production deployment
vercel --prod
```

When prompted:

- **Set up and deploy?**: `y`
- **Which scope?**: Select your account / team
- **Link to existing project?**: `n`
- **Project name**: `pramana` (or any name)
- **In which directory is your code located?**: `./`

The CLI will read [`vercel.json`](file:///c:/project-self-1/pramana/vercel.json) and deploy automatically.

---

## 🛠️ Monorepo Configuration Details

- **Single Page Application (SPA) Routing**: Root and frontend [`vercel.json`](file:///c:/project-self-1/pramana/vercel.json) include rewrites (`/(.*) -> /index.html`) to ensure paths like `/wallet` and `/verifier` refresh without 404 errors.
- **Cross-Origin API (CORS)**: The Fastify backend has permissive CORS (`origin: true`) configured in [`backend/src/server.ts`](file:///c:/project-self-1/pramana/backend/src/server.ts), allowing Vercel preview and production domains to connect directly without CORS blocking.
- **Zero-PII Architecture**: The frontend wallet and consent UI execute client-side selective disclosure and verification without storing any citizen PII.
