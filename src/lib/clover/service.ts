/**
 * Clover Service Layer
 * Business logic for Clover operations
 */

import { cloverClient } from './client';
import type {
  CloverAtomicOrder,
  CloverLineItem,
  CloverOrder,
  CloverChargeResponse,
  LocalCartItem,
  OrderSubmissionData,
} from '@/types/clover';

// ============================================
// Order Mapping & Submission
// ============================================

/**
 * Format the order note for web orders with customer info
 */
function formatWebOrderNote(data: OrderSubmissionData): string {
  const lines = [
    '*** WEB ORDER ***',
    `Customer: ${data.customer.firstName} ${data.customer.lastName}`,
    `Phone: ${data.customer.phone}`,
    `Email: ${data.customer.email}`,
    `Pickup: ${data.pickupDate} at ${data.pickupTime}`,
  ];

  if (data.specialInstructions) {
    lines.push(`Notes: ${data.specialInstructions}`);
  }

  lines.push('***************');

  return lines.join('\n');
}

/**
 * Map a local cart item to Clover line item format
 * Creates separate line items for each quantity (qty 2 = 2 line items)
 * This ensures proper display on receipts instead of combined pricing
 */
function mapCartItemToLineItems(item: LocalCartItem, taxRateIds?: { id: string }[]): CloverLineItem[] {
  // Calculate item price in cents
  const unitPrice = Math.round(item.basePrice * 100);

  // Map modifiers
  const modifications = item.modifiers.map((mod) => ({
    modifier: mod.cloverModId ? { id: mod.cloverModId } : undefined,
    name: mod.name,
    amount: Math.round(mod.price * 100),
  }));

  // Create separate line items for each quantity
  const lineItems: CloverLineItem[] = [];
  for (let i = 0; i < item.quantity; i++) {
    lineItems.push({
      item: item.cloverItemId ? { id: item.cloverItemId } : undefined,
      name: item.name,
      price: unitPrice,
      unitQty: 1000, // 1000 = 1 unit in Clover
      printed: false,
      note: item.specialInstructions || undefined,
      modifications: modifications.length > 0 ? modifications : undefined,
      taxRates: taxRateIds, // Apply merchant's tax rates to line item
    });
  }

  return lineItems;
}

// Order type ID for web orders (from Clover Dashboard)
const CLOVER_WEB_ORDER_TYPE_ID = process.env.CLOVER_WEB_ORDER_TYPE_ID;

/**
 * Map cart data to Clover atomic order format
 */
export function mapCartToCloverOrder(
  data: OrderSubmissionData,
  customerId?: string,
  taxRateIds?: { id: string }[]
): CloverAtomicOrder {
  // Flatten line items (each quantity becomes a separate line item)
  // Apply tax rates to each line item so Clover calculates tax
  const lineItems = data.items.flatMap((item) => mapCartItemToLineItems(item, taxRateIds));

  return {
    orderCart: {
      lineItems,
      title: `*** ONLINE ORDER - ${data.pickupDate} ${data.pickupTime} ***`,
      note: formatWebOrderNote(data),
      // Don't set orderType - let Clover use default which has tax enabled
      customers: customerId ? [{ id: customerId }] : undefined,
    },
  };
}

/**
 * Submit order to Clover and trigger kitchen print
 */
export async function submitOrderToClover(
  data: OrderSubmissionData
): Promise<{ cloverOrder: CloverOrder; printed: boolean; customerId?: string }> {
  // Get or create customer in Clover
  let customerId: string | undefined;
  try {
    console.log('[CloverService] Creating/finding customer:', {
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.email,
      phone: data.customer.phone,
    });
    const customer = await cloverClient.getOrCreateCustomer({
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.email,
      phone: data.customer.phone,
    });
    customerId = customer.id;
    console.log('[CloverService] Customer created/found:', customerId);
  } catch (error) {
    console.error('[CloverService] Failed to create/find customer:', error);
    // Continue without customer - order will still be created
  }

  // Map cart to Clover order format (with customer if available)
  const atomicOrder = mapCartToCloverOrder(data, customerId);

  // Create the order in Clover
  const cloverOrder = await cloverClient.createAtomicOrder(atomicOrder);

  // Trigger kitchen print
  let printed = false;
  try {
    await cloverClient.triggerPrint(cloverOrder.id);
    printed = true;
  } catch (error) {
    console.error('[CloverService] Failed to trigger print:', error);
    // Don't fail the order if print fails
  }

  return { cloverOrder, printed, customerId };
}

/**
 * Process payment for an existing Clover order using tokenized card
 * Uses /v1/orders/{orderId}/pay to link payment to order's line items
 */
export async function processPayment(
  token: string,
  localOrderId: string,
  cloverOrderId: string,
  totalAmountCents: number,
  taxAmountCents: number,
  customerEmail?: string
): Promise<CloverChargeResponse> {
  // Generate idempotency key from order ID
  const idempotencyKey = `order_${localOrderId}_${Date.now()}`;

  // Use payForOrder with explicit amount and tax_amount
  // This tells Clover exactly how much to charge and what portion is tax
  const payRequest = {
    source: token,
    email: customerEmail,
    ecomind: 'ecom' as const,
    amount: totalAmountCents,
    tax_amount: taxAmountCents,
  };

  console.log('[CloverService] Paying for order:', cloverOrderId, JSON.stringify(payRequest, null, 2));

  const paymentResponse = await cloverClient.payForOrder(
    cloverOrderId,
    payRequest,
    idempotencyKey
  );

  return paymentResponse;
}

/**
 * Error thrown by submitOrderWithPayment, tagged with which stage failed so the
 * charge route can log it. leakedCloverOrderId is set when an unpaid Clover
 * order was created but could not be deleted afterwards.
 */
export interface StagedCheckoutError extends Error {
  stage?: 'clover_order_create' | 'payment';
  leakedCloverOrderId?: string;
}

/**
 * Delete an unpaid Clover order, retrying transient failures. Returns false if
 * the order could not be deleted (it then lingers open in Clover and must be
 * removed manually — seen once on 2026-08-26).
 */
async function deleteOrderWithRetry(cloverOrderId: string): Promise<boolean> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await cloverClient.deleteOrder(cloverOrderId);
      return true;
    } catch (error) {
      console.error(
        `[CloverService] Delete attempt ${attempt}/3 failed for unpaid order ${cloverOrderId}:`,
        error
      );
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  console.error(
    `[CloverService] LEAKED unpaid Clover order ${cloverOrderId} — all delete attempts failed; remove it manually in Clover.`
  );
  return false;
}

/**
 * Full order flow: create order, process payment, then print only if payment succeeds
 */
export async function submitOrderWithPayment(
  data: OrderSubmissionData,
  paymentToken: string,
  localOrderId: string
): Promise<{
  cloverOrder: CloverOrder;
  payment: CloverChargeResponse;
  printed: boolean;
}> {
  // Step 1: Create order in Clover (WITHOUT printing - we'll print only after payment succeeds)
  let created: { cloverOrder: CloverOrder; customerId?: string };
  try {
    created = await createOrderWithoutPrint(data);
  } catch (error) {
    (error as StagedCheckoutError).stage = 'clover_order_create';
    throw error;
  }
  const { cloverOrder, customerId } = created;

  // Step 2: Process payment for the Clover order
  // Calculate amounts in cents from the order data
  const totalAmountCents = Math.round(data.total * 100);
  const taxAmountCents = Math.round(data.tax * 100);

  let payment: CloverChargeResponse;
  try {
    payment = await processPayment(
      paymentToken,
      localOrderId,
      cloverOrder.id,
      totalAmountCents,
      taxAmountCents,
      data.customer.email
    );
  } catch (error) {
    // Payment failed - delete the Clover order
    console.error('[CloverService] Payment failed, deleting order:', cloverOrder.id);
    const deleted = await deleteOrderWithRetry(cloverOrder.id);
    const staged = error as StagedCheckoutError;
    staged.stage = 'payment';
    if (!deleted) staged.leakedCloverOrderId = cloverOrder.id;
    throw error;
  }

  // Verify payment succeeded
  // Note: /v1/charges returns status: 'succeeded', but /v1/orders/{id}/pay returns status: 'paid'
  const isPaymentSuccessful = payment.status === 'succeeded' || payment.status === 'paid' || payment.paid === true;
  if (!isPaymentSuccessful) {
    // Payment declined - delete the Clover order
    console.error('[CloverService] Payment declined, deleting order:', cloverOrder.id, 'status:', payment.status);
    const deleted = await deleteOrderWithRetry(cloverOrder.id);
    const declineError: StagedCheckoutError = new Error(
      `Payment failed: ${payment.failure_message || 'Unknown error'}`
    );
    declineError.stage = 'payment';
    if (!deleted) declineError.leakedCloverOrderId = cloverOrder.id;
    throw declineError;
  }

  // Step 3: Payment succeeded - now trigger print
  let printed = false;
  try {
    await cloverClient.triggerPrint(cloverOrder.id);
    printed = true;
  } catch (error) {
    console.error('[CloverService] Failed to trigger print:', error);
    // Don't fail the order if print fails - payment already succeeded
  }

  return {
    cloverOrder,
    payment,
    printed,
  };
}

/**
 * Create order in Clover without triggering print
 */
async function createOrderWithoutPrint(
  data: OrderSubmissionData
): Promise<{ cloverOrder: CloverOrder; customerId?: string }> {
  // Fetch merchant's tax rates to apply to line items
  let taxRateIds: { id: string }[] | undefined;
  try {
    console.log('[CloverService] Fetching merchant tax rates...');
    const taxRates = await cloverClient.getTaxRates();
    console.log('[CloverService] Tax rates found:', taxRates);
    // Use all tax rates (or just default ones if you prefer)
    taxRateIds = taxRates.map((tr) => ({ id: tr.id }));
  } catch (error) {
    console.error('[CloverService] Failed to fetch tax rates:', error);
    // Continue without tax rates - payment will still work with amount override
  }

  // Get or create customer in Clover
  let customerId: string | undefined;
  try {
    console.log('[CloverService] Creating/finding customer:', {
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.email,
      phone: data.customer.phone,
    });
    const customer = await cloverClient.getOrCreateCustomer({
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.email,
      phone: data.customer.phone,
    });
    customerId = customer.id;
    console.log('[CloverService] Customer created/found:', customerId);
  } catch (error) {
    console.error('[CloverService] Failed to create/find customer:', error);
  }

  // Map cart to Clover order format with tax rates applied to line items
  const atomicOrder = mapCartToCloverOrder(data, customerId, taxRateIds);
  console.log('[CloverService] Creating atomic order with tax rates:', JSON.stringify(atomicOrder, null, 2));

  // Create the order in Clover (no print trigger)
  // Clover will calculate tax based on the tax rates applied to line items
  const cloverOrder = await cloverClient.createAtomicOrder(atomicOrder);
  console.log('[CloverService] Order created, total:', cloverOrder.total);

  return { cloverOrder, customerId };
}

// ============================================
// Order Management
// ============================================

/**
 * Get order status from Clover
 */
export async function getOrderStatus(cloverOrderId: string): Promise<{
  state: string;
  paid: boolean;
  total: number;
}> {
  const order = await cloverClient.getOrder(cloverOrderId);

  const payments = order.payments?.elements || [];
  const paid = payments.some((p) => p.result === 'SUCCESS');

  return {
    state: order.state,
    paid,
    total: order.total / 100, // Convert from cents
  };
}

/**
 * Cancel an order in Clover
 */
export async function cancelOrder(cloverOrderId: string): Promise<void> {
  await cloverClient.deleteOrder(cloverOrderId);
}

// ============================================
// Export service
// ============================================

export const cloverService = {
  mapCartToCloverOrder,
  submitOrderToClover,
  processPayment,
  submitOrderWithPayment,
  getOrderStatus,
  cancelOrder,
};
