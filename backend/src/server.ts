/**
 * @fileoverview Pramāṇa Protocol Backend Server Entry Point
 * Fastify + TypeScript
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { registerRoutes } from './routes/index.js';
import { logger } from './utils/logger.js';

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false, // We use custom redaction-aware logger
  });

  // Security & Middleware
  await fastify.register(cors, {
    origin: true,
  });

  fastify.addHook('onRequest', rateLimiter);
  fastify.setErrorHandler(errorHandler);

  // Routes
  await registerRoutes(fastify);

  return fastify;
}

export async function start(): Promise<void> {
  try {
    const server = await buildServer();
    await server.listen({ port: config.port, host: config.host });
    logger.info(`Pramāṇa Backend listening at http://${config.host}:${config.port}`);
  } catch (err) {
    logger.error('Failed to start Pramāṇa backend server', err);
    process.exit(1);
  }
}

// Auto-start if run directly
if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  void start();
}
