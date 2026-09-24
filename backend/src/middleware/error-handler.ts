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
    let statusCode = 400;

    switch (error.code) {
      case ERROR_CODES.LICENCE_INVALID:
      case ERROR_CODES.VERIFIER_NOT_AUTHORIZED:
      case ERROR_CODES.PURPOSE_NOT_AUTHORIZED:
      case ERROR_CODES.ATTRIBUTE_NOT_AUTHORIZED:
      case ERROR_CODES.PREDICATE_NOT_AUTHORIZED:
        statusCode = 403;
        break;
      case ERROR_CODES.CONSENT_TEMPLATE_NOT_FOUND:
      case ERROR_CODES.REGISTRY_LOOKUP_FAILED:
        statusCode = 404;
        break;
      case ERROR_CODES.PROOF_VERIFICATION_FAILED:
        statusCode = 422;
        break;
      case ERROR_CODES.NOT_IMPLEMENTED:
        statusCode = 501;
        break;
      case ERROR_CODES.EXPIRED_REQUEST:
      case ERROR_CODES.REPLAY_DETECTED:
      case ERROR_CODES.DATA_MINIMIZATION_VIOLATION:
      case ERROR_CODES.INVALID_REQUEST:
      case ERROR_CODES.INVALID_PREDICATE:
      case ERROR_CODES.INVALID_CONSENT:
      default:
        statusCode = 400;
        break;
    }

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
