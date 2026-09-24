/**
 * @fileoverview Vercel Serverless Function Entry Point for Pramāṇa Backend
 * Wraps Fastify instance into a serverless request handler.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildServer } from '../backend/src/server.js';

let appPromise: ReturnType<typeof buildServer> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!appPromise) {
    appPromise = buildServer().then(async (app) => {
      await app.ready();
      return app;
    });
  }
  const app = await appPromise;
  app.server.emit('request', req, res);
}
