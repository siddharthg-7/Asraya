import { describe, it, expect } from 'vitest';
import { buildServer } from '../src/server.js';
import { PROTOCOL_NAME, PROTOCOL_VERSION } from '@pramana/shared';

describe('Backend Server Routes Test', () => {
  it('should respond with healthy status from /health endpoint', async () => {
    const server = await buildServer();
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('UP');
    expect(body.protocol).toBe(PROTOCOL_NAME);
    expect(body.version).toBe(PROTOCOL_VERSION);
    await server.close();
  });

  it('should formulate request contract via /api/v1/requests', async () => {
    const server = await buildServer();
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: {
        verifierDid: 'did:pramana:verifier:venue-01',
        verifierName: 'Venue Access',
        purpose: 'PURPOSE_AGE_VERIFICATION',
        context: 'venue-entry',
        predicates: [
          {
            attributeId: 'urn:pramana:attr:civil:age',
            operator: 'LTE',
            constant: 18,
          },
        ],
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.verifier.name).toBe('Venue Access');
    expect(body.nonce.length).toBe(64);
    await server.close();
  });
});
