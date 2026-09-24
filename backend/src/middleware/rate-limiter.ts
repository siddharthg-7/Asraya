/**
 * @fileoverview Basic Ephemeral Rate Limiting Middleware
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { FastifyRequest, FastifyReply } from 'fastify';

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 60;

export async function rateLimiter(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const ip = request.ip || '127.0.0.1';
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || record.resetAt <= now) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60000 });
    return;
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS_PER_MINUTE) {
    reply.status(429).send({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please retry in one minute.',
      timestamp: new Date().toISOString(),
    });
  }
}
