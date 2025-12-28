/**
 * Clover POS API Client
 * Server-side only - contains sensitive credentials
 */

import type {
  CloverApiResponse,
  CloverItemExpanded,
  CloverCategory,
  CloverModifierGroup,
  CloverAtomicOrder,
  CloverOrder,
  CloverCharge,
  CloverChargeResponse,
  CloverPrintEvent,
  CloverMerchant,
  CloverCustomer,
  CloverCustomerCreate,
  CloverErrorResponse,
} from '@/types/clover';

// Environment configuration
const CLOVER_API_BASE_URL = process.env.CLOVER_API_BASE_URL || 'https://sandbox.dev.clover.com';
const CLOVER_ECOM_BASE_URL = process.env.CLOVER_ECOM_BASE_URL || 'https://scl-sandbox.dev.clover.com';
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;
// Private key for Ecommerce API (charges) - different from the public PAKMS key
const CLOVER_ECOM_PRIVATE_KEY = process.env.CLOVER_ECOM_PRIVATE_KEY;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

class CloverApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public cloverError?: CloverErrorResponse
  ) {
    super(message);
    this.name = 'CloverApiError';
  }
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make authenticated request to Clover API with retry logic
 */
async function cloverFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  useEcomBase = false
): Promise<T> {
  if (!CLOVER_MERCHANT_ID || !CLOVER_ACCESS_TOKEN) {
    throw new Error('Clover configuration missing: CLOVER_MERCHANT_ID or CLOVER_ACCESS_TOKEN');
  }

  const baseUrl = useEcomBase ? CLOVER_ECOM_BASE_URL : CLOVER_API_BASE_URL;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  // Use private key for Ecommerce API, regular access token for other APIs
  const authToken = useEcomBase && CLOVER_ECOM_PRIVATE_KEY
    ? CLOVER_ECOM_PRIVATE_KEY
    : CLOVER_ACCESS_TOKEN;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add merchant ID header for Ecommerce API calls
  if (useEcomBase && CLOVER_MERCHANT_ID) {
    headers['X-Clover-Merchant-Id'] = CLOVER_MERCHANT_ID;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : RETRY_DELAY_MS * attempt;
        console.log(`[Clover] Rate limited, waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
        continue;
      }

      // Handle other errors
      if (!response.ok) {
        let errorData: CloverErrorResponse | undefined;
        let rawError: string = '';
        try {
          rawError = await response.text();
          errorData = JSON.parse(rawError);
        } catch {
          // Response might not be JSON
        }

        console.error('[Clover API Error]', {
          url,
          status: response.status,
          rawError,
          errorData,
        });

        throw new CloverApiError(
          errorData?.message || rawError || `Clover API error: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      // Parse successful response
      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors or bad requests
      if (error instanceof CloverApiError) {
        if (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 400) {
          throw error;
        }
      }

      // Retry on network errors or 5xx errors
      if (attempt < MAX_RETRIES) {
        console.log(`[Clover] Request failed, attempt ${attempt}/${MAX_RETRIES}, retrying...`);
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError || new Error('Clover API request failed after retries');
}

// ============================================
// Menu & Inventory Methods
// ============================================

/**
 * Get all menu items with expanded modifiers and categories
 */
export async function getItems(): Promise<CloverItemExpanded[]> {
  const response = await cloverFetch<CloverApiResponse<CloverItemExpanded>>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/items?expand=modifierGroups.modifiers,categories`
  );
  return response.elements || [];
}

/**
 * Get a single menu item by ID
 */
export async function getItem(itemId: string): Promise<CloverItemExpanded> {
  return cloverFetch<CloverItemExpanded>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/items/${itemId}?expand=modifierGroups.modifiers,categories`
  );
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<CloverCategory[]> {
  const response = await cloverFetch<CloverApiResponse<CloverCategory>>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/categories`
  );
  return response.elements || [];
}

/**
 * Get all modifier groups
 */
export async function getModifierGroups(): Promise<CloverModifierGroup[]> {
  const response = await cloverFetch<CloverApiResponse<CloverModifierGroup>>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/modifier_groups?expand=modifiers`
  );
  return response.elements || [];
}

// ============================================
// Order Methods
// ============================================

/**
 * Create an atomic order (order with line items in a single call)
 */
export async function createAtomicOrder(order: CloverAtomicOrder): Promise<CloverOrder> {
  return cloverFetch<CloverOrder>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/atomic_order/orders`,
    {
      method: 'POST',
      body: JSON.stringify(order),
    }
  );
}

/**
 * Get an order by ID
 */
export async function getOrder(orderId: string): Promise<CloverOrder> {
  return cloverFetch<CloverOrder>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/orders/${orderId}?expand=lineItems,payments`
  );
}

/**
 * Update an order
 */
export async function updateOrder(
  orderId: string,
  updates: Partial<Pick<CloverOrder, 'state' | 'taxRemoved'>>
): Promise<CloverOrder> {
  return cloverFetch<CloverOrder>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/orders/${orderId}`,
    {
      method: 'POST',
      body: JSON.stringify(updates),
    }
  );
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string): Promise<void> {
  await cloverFetch<void>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/orders/${orderId}`,
    {
      method: 'DELETE',
    }
  );
}

// ============================================
// Payment Methods (Ecommerce API)
// ============================================

/**
 * Create a charge using tokenized card
 * Uses the Ecommerce API endpoint
 */
export async function createCharge(
  charge: CloverCharge,
  idempotencyKey?: string
): Promise<CloverChargeResponse> {
  const headers: Record<string, string> = {};

  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  return cloverFetch<CloverChargeResponse>(
    `/v1/charges`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(charge),
    },
    true // Use ecommerce base URL
  );
}

/**
 * Get a charge by ID
 */
export async function getCharge(chargeId: string): Promise<CloverChargeResponse> {
  return cloverFetch<CloverChargeResponse>(
    `/v1/charges/${chargeId}`,
    {},
    true
  );
}

/**
 * Refund a charge
 */
export async function refundCharge(
  chargeId: string,
  amount?: number,
  reason?: string
): Promise<{ id: string; amount: number; status: string }> {
  return cloverFetch(
    `/v1/refunds`,
    {
      method: 'POST',
      body: JSON.stringify({
        charge: chargeId,
        amount,
        reason,
      }),
    },
    true
  );
}

// ============================================
// Print Methods
// ============================================

/**
 * Trigger print for an order
 */
export async function triggerPrint(orderId: string): Promise<void> {
  const printEvent: CloverPrintEvent = {
    orderRef: { id: orderId },
  };

  await cloverFetch<void>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/print_event`,
    {
      method: 'POST',
      body: JSON.stringify(printEvent),
    }
  );
}

// ============================================
// Merchant Methods
// ============================================

/**
 * Get merchant information
 */
export async function getMerchant(): Promise<CloverMerchant> {
  return cloverFetch<CloverMerchant>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}`
  );
}

// ============================================
// Customer Methods
// ============================================

/**
 * Create a new customer
 */
export async function createCustomer(customer: CloverCustomerCreate): Promise<CloverCustomer> {
  return cloverFetch<CloverCustomer>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/customers`,
    {
      method: 'POST',
      body: JSON.stringify(customer),
    }
  );
}

/**
 * Find customer by email
 */
export async function findCustomerByEmail(email: string): Promise<CloverCustomer | null> {
  const response = await cloverFetch<CloverApiResponse<CloverCustomer>>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/customers?filter=emailAddress=${encodeURIComponent(email)}&expand=emailAddresses,phoneNumbers`
  );
  return response.elements?.[0] || null;
}

/**
 * Find customer by phone
 */
export async function findCustomerByPhone(phone: string): Promise<CloverCustomer | null> {
  // Normalize phone number (remove non-digits)
  const normalizedPhone = phone.replace(/\D/g, '');
  const response = await cloverFetch<CloverApiResponse<CloverCustomer>>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/customers?filter=phoneNumber=${encodeURIComponent(normalizedPhone)}&expand=emailAddresses,phoneNumbers`
  );
  return response.elements?.[0] || null;
}

/**
 * Find customer by name
 */
export async function findCustomerByName(firstName: string, lastName: string): Promise<CloverCustomer | null> {
  const response = await cloverFetch<CloverApiResponse<CloverCustomer>>(
    `/v3/merchants/${CLOVER_MERCHANT_ID}/customers?filter=firstName=${encodeURIComponent(firstName)}&filter=lastName=${encodeURIComponent(lastName)}&expand=emailAddresses,phoneNumbers`
  );
  return response.elements?.[0] || null;
}

/**
 * Get or create customer
 * First tries to find by email, then by phone, then creates new
 */
export async function getOrCreateCustomer(
  data: { firstName: string; lastName: string; email: string; phone: string }
): Promise<CloverCustomer> {
  // Try to find existing customer by email first
  let customer = await findCustomerByEmail(data.email);
  if (customer) {
    return customer;
  }

  // Try to find by phone
  customer = await findCustomerByPhone(data.phone);
  if (customer) {
    return customer;
  }

  // Create new customer
  const newCustomer = await createCustomer({
    firstName: data.firstName,
    lastName: data.lastName,
    emailAddresses: [{ emailAddress: data.email }],
    phoneNumbers: [{ phoneNumber: data.phone.replace(/\D/g, '') }],
    marketingAllowed: false,
  });
  return newCustomer;
}

// ============================================
// Export client instance
// ============================================

export const cloverClient = {
  // Menu & Inventory
  getItems,
  getItem,
  getCategories,
  getModifierGroups,

  // Orders
  createAtomicOrder,
  getOrder,
  updateOrder,
  deleteOrder,

  // Payments
  createCharge,
  getCharge,
  refundCharge,

  // Print
  triggerPrint,

  // Merchant
  getMerchant,

  // Customers
  createCustomer,
  findCustomerByEmail,
  findCustomerByPhone,
  findCustomerByName,
  getOrCreateCustomer,
};

export { CloverApiError };
