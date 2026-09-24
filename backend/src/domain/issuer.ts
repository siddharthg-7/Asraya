/**
 * @fileoverview Issuer Domain Model
 * Pramāṇa Protocol - Phase 1 Foundation
 */

import { VerifiableCredential } from '@pramana/shared';

export interface IIssuerService {
  readonly did: string;
  readonly legalName: string;

  /**
   * Issues a certified multi-message BBS credential to a citizen
   */
  issueCredential(
    schemaId: string,
    holderPublicKeyHash: string,
    claims: Record<string, string | number | boolean>,
  ): Promise<VerifiableCredential>;
}
