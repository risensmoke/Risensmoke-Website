/**
 * Clover POS Integration
 *
 * This module provides integration with Clover POS for:
 * - Payment processing via Clover Ecommerce API
 * - Order submission to Clover Dashboard
 * - Menu synchronization from Clover inventory
 * - Webhook handling for order updates
 *
 * IMPORTANT: The client and service modules are server-side only.
 * Never import them in client components.
 */

// Server-side exports (API routes only)
export { cloverClient, CloverApiError } from './client';
export { cloverService } from './service';
export { menuExportService } from './menuExport';

// Re-export types for convenience
export type {
  CloverItem,
  CloverItemExpanded,
  CloverCategory,
  CloverModifierGroup,
  CloverModifier,
  CloverAtomicOrder,
  CloverOrder,
  CloverLineItem,
  CloverCharge,
  CloverChargeResponse,
  CloverWebhookPayload,
  CloverWebhookEvent,
  LocalCartItem,
  LocalCartModifier,
  OrderSubmissionData,
} from '@/types/clover';
