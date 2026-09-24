/**
 * @fileoverview UI State & Presentation Types
 * Pramāṇa Protocol - Phase 1 Foundation
 */

export type ActiveTab = 'overview' | 'wallet' | 'verifier' | 'receipts';

export interface UIStatusNotification {
  readonly id: string;
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly message: string;
}
