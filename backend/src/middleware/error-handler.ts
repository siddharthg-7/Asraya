/**
 * @fileoverview Fastify Error Handler Middleware
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { PramanaError, ERROR_CODES } from '@pramana/shared';
import { logger } from '../utils/logger.js';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  logger.error('API request error encountered', error, {
    url: request.url,
    method: request.method,
  });

  if (error instanceof PramanaError) {
    const statusCode =
      error.code === ERROR_CODES.EXPIRED_REQUEST || error.code === ERROR_CODES.REPLAY_DETECTED
        ? 400
        : error.code === ERROR_CODES.PROOF_VERIFICATION_FAILED
          ? 422
          : error.code === ERROR_CODES.NOT_IMPLEMENTED
            ? 501
            : 400;

    reply.status(statusCode).send(error.toJSON());
    return;
  }

  // Generic sanitized fallback error
  reply.status(500).send({
    code: ERROR_CODES.INTERNAL_PROTOCOL_ERROR,
    message: 'An internal protocol error occurred.',
    timestamp: new Date().toISOString(),
  });
}
