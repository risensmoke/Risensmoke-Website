// Clover POS API Type Definitions

// ============================================
// Menu & Inventory Types
// ============================================

export interface CloverItem {
  id: string;
  name: string;
  price: number; // in cents
  priceType: 'FIXED' | 'VARIABLE' | 'PER_UNIT';
  unitName?: string;
  defaultTaxRates: boolean;
  isRevenue: boolean;
  stockCount?: number;
  cost?: number;
  sku?: string;
  code?: string;
  hidden: boolean;
  available: boolean;
  modifierGroups?: CloverModifierGroupReference;
  categories?: CloverCategoryReference;
  tags?: CloverTag[];
}

export interface CloverItemExpanded extends CloverItem {
  modifierGroups?: {
    elements: CloverModifierGroup[];
  };
  categories?: {
    elements: CloverCategory[];
  };
}

export interface CloverCategory {
  id: string;
  name: string;
  sortOrder?: number;
  items?: CloverItemReference;
}

export interface CloverModifierGroup {
  id: string;
  name: string;
  minRequired?: number;
  maxAllowed?: number;
  showByDefault: boolean;
  modifiers?: {
    elements: CloverModifier[];
  };
}

export interface CloverModifier {
  id: string;
  name: string;
  price?: number; // in cents
  available: boolean;
  modifierGroup?: { id: string };
}

export interface CloverTag {
  id: string;
  name: string;
}

// Reference types for nested objects
export interface CloverItemReference {
  elements: { id: string }[];
}

export interface CloverCategoryReference {
  elements: { id: string }[];
}

export interface CloverModifierGroupReference {
  elements: { id: string }[];
}

// ============================================
// Order Types
// ============================================

export interface CloverAtomicOrder {
  orderCart: CloverOrderCart;
}

export interface CloverOrderCart {
  lineItems: CloverLineItem[];
  discounts?: CloverDiscount[];
  note?: string;
  title?: string; // Appears prominently on receipt (e.g., "*** ONLINE ORDER ***")
  orderType?: { id: string }; // Reference to order type
  customers?: { id: string }[]; // Customer references
}

export interface CloverLineItem {
  item?: { id: string };
  name: string;
  price: number; // in cents
  unitQty?: number;
  printed?: boolean;
  note?: string;
  modifications?: CloverModification[];
}

export interface CloverModification {
  modifier?: { id: string };
  name: string;
  amount: number; // in cents
}

export interface CloverDiscount {
  name: string;
  amount?: number;
  percentage?: number;
}

export interface CloverOrder {
  id: string;
  currency: string;
  employee?: { id: string };
  total: number;
  state: 'OPEN' | 'LOCKED' | 'CLOSED';
  taxRemoved: boolean;
  isVat: boolean;
  manualTransaction: boolean;
  groupLineItems: boolean;
  testMode: boolean;
  createdTime: number;
  modifiedTime: number;
  lineItems?: {
    elements: CloverOrderLineItem[];
  };
  payments?: {
    elements: CloverPayment[];
  };
}

export interface CloverOrderLineItem {
  id: string;
  name: string;
  price: number;
  printed: boolean;
  exchanged: boolean;
  refunded: boolean;
  createdTime: number;
  modifications?: {
    elements: CloverOrderModification[];
  };
}

export interface CloverOrderModification {
  id: string;
  name: string;
  amount: number;
}

// ============================================
// Payment Types
// ============================================

export interface CloverCharge {
  source: string; // Tokenized card (clv_xxx)
  amount: number; // in cents
  currency: string;
  capture?: boolean;
  description?: string;
  external_reference_id?: string;
  receipt_email?: string;
  soft_descriptor?: string;
  stored_credentials?: {
    sequence: 'FIRST' | 'SUBSEQUENT';
    is_scheduled: boolean;
    initiator: 'CARDHOLDER' | 'MERCHANT';
  };
  ecomind?: 'ecom' | 'moto';
  metadata?: Record<string, string>;
  order_id?: string; // Clover order ID to link payment to order
}

export interface CloverChargeResponse {
  id: string;
  amount: number;
  payment_method_details: string;
  amount_refunded: number;
  captured: boolean;
  created: number;
  currency: string;
  description?: string;
  external_reference_id?: string;
  failure_code?: string;
  failure_message?: string;
  outcome: {
    network_status: string;
    type: string;
  };
  paid: boolean;
  ref_num: string;
  status: 'succeeded' | 'pending' | 'failed';
  source: {
    id: string;
    brand: string;
    exp_month: string;
    exp_year: string;
    first6: string;
    last4: string;
  };
}

export interface CloverPayment {
  id: string;
  amount: number;
  tipAmount?: number;
  taxAmount?: number;
  cashbackAmount?: number;
  result: 'SUCCESS' | 'FAIL' | 'INITIATED' | 'VOIDED' | 'VOIDING' | 'AUTH' | 'AUTH_COMPLETED';
  cardTransaction?: {
    cardType: string;
    last4: string;
    authCode: string;
  };
  createdTime: number;
}

export interface CloverRefund {
  id: string;
  payment: { id: string };
  amount: number;
  createdTime: number;
}

// ============================================
// Webhook Types
// ============================================

export type CloverWebhookEventType =
  | 'orders.created'
  | 'orders.updated'
  | 'orders.deleted'
  | 'payments.created'
  | 'payments.updated'
  | 'items.created'
  | 'items.updated'
  | 'items.deleted';

export interface CloverWebhookPayload {
  appId: string;
  merchants: {
    [merchantId: string]: CloverWebhookEvent[];
  };
}

export interface CloverWebhookEvent {
  type: CloverWebhookEventType;
  objectId: string;
  ts: number;
}

// ============================================
// API Response Types
// ============================================

export interface CloverApiResponse<T> {
  elements: T[];
  href?: string;
}

export interface CloverErrorResponse {
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================
// Print Types
// ============================================

export interface CloverPrintEvent {
  orderRef: { id: string };
}

// ============================================
// Customer Types
// ============================================

export interface CloverCustomer {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddresses?: {
    elements: { id: string; emailAddress: string; primaryEmail?: boolean }[];
  };
  phoneNumbers?: {
    elements: { id: string; phoneNumber: string }[];
  };
  marketingAllowed?: boolean;
}

export interface CloverCustomerCreate {
  firstName?: string;
  lastName?: string;
  emailAddresses?: { emailAddress: string }[];
  phoneNumbers?: { phoneNumber: string }[];
  marketingAllowed?: boolean;
}

// ============================================
// Merchant Types
// ============================================

export interface CloverMerchant {
  id: string;
  name: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  phoneNumber?: string;
  website?: string;
  tipsEnabled: boolean;
  timezone: string;
}

// ============================================
// Local Types (for internal use)
// ============================================

export interface LocalCartItem {
  menuItemId?: string | null;
  cloverItemId?: string;
  name: string;
  basePrice: number;
  quantity: number;
  modifiers: LocalCartModifier[];
  specialInstructions?: string;
  totalPrice: number;
}

export interface LocalCartModifier {
  id?: string | null;
  cloverModId?: string;
  name: string;
  price: number;
  category?: string;
}

export interface OrderSubmissionData {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pickupTime: string;
  pickupDate: string;
  specialInstructions?: string;
  items: LocalCartItem[];
  subtotal: number;
  tax: number;
  total: number;
}
