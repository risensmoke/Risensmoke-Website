# Clover POS Integration Plan - Rise N' Smoke

## Overview

Integrate Clover POS with the Rise N' Smoke online ordering website for:
- **Payments**: Process online payments via Clover
- **Menu Sync**: Pull menu items from Clover Dashboard
- **Order Submission**: Send orders to Clover system
- **Kitchen Printing**: Print orders directly to kitchen printer with "WEB ORDER" distinction

## Critical Security Requirement

**All Clover API keys must remain server-side only.** The architecture ensures:
- `CLOVER_ACCESS_TOKEN` - Never exposed to client (no `NEXT_PUBLIC_` prefix)
- `CLOVER_API_KEY` (PAKMS public key) - Only key exposed to client for secure iframe tokenization
- All API calls to Clover go through Next.js API routes

---

## Pre-Requisite: Clover Developer Setup

Before implementation, you must:

1. **Create Clover Developer Account**: https://sandbox.dev.clover.com/developer-home/create-account
2. **Create a Sandbox App**: In developer dashboard, create an app with these permissions:
   - `INVENTORY_R` - Read menu items
   - `ORDERS_W` - Create orders
   - `PAYMENTS_W` - Process payments
   - `MERCHANT_R` - Read merchant info
3. **Install App on Test Merchant**: Get your sandbox merchant ID
4. **Generate API Token**: Create OAuth access token for your app
5. **Get PAKMS API Key**: For iframe payment tokenization (Ecommerce settings)

---

## Phase 1: Configuration Changes

### 1.1 Update Next.js Config (REQUIRED)

**File**: `next.config.ts`

Remove static export to enable API routes:
```typescript
const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  }
};
```

### 1.2 Update Netlify Configuration (REQUIRED)

**File**: `netlify.toml`

Current config uses static export. Update for Next.js Runtime:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Install Netlify Plugin**:
```bash
npm install -D @netlify/plugin-nextjs
```

This enables:
- API routes as Netlify Functions
- Server-side rendering
- Incremental Static Regeneration

### 1.3 Update Environment Variables

**File**: `.env.example` - Add these Clover variables:

```env
# Clover POS Integration
CLOVER_API_BASE_URL=https://sandbox.dev.clover.com   # Production: https://api.clover.com
CLOVER_ECOM_BASE_URL=https://scl-sandbox.dev.clover.com  # Production: https://scl.clover.com
CLOVER_MERCHANT_ID=your_merchant_id
CLOVER_ACCESS_TOKEN=your_oauth_access_token          # SERVER-SIDE ONLY
CLOVER_WEBHOOK_SECRET=your_webhook_secret

# Clover Iframe (public key for payment tokenization)
NEXT_PUBLIC_CLOVER_API_KEY=your_pakms_api_key        # Safe to expose
NEXT_PUBLIC_CLOVER_SDK_URL=https://checkout.sandbox.dev.clover.com/sdk.js
```

---

## Phase 2: Server-Side Clover Client

### 2.1 Create Type Definitions

**New File**: `src/types/clover.ts`

TypeScript interfaces for:
- `CloverItem`, `CloverCategory`, `CloverModifierGroup`, `CloverModifier`
- `CloverAtomicOrder`, `CloverLineItem`, `CloverModification`
- `CloverCharge`, `CloverChargeResponse`
- `CloverWebhookPayload`, `CloverWebhookEvent`

### 2.2 Create Clover API Client

**New File**: `src/lib/clover/client.ts`

Secure server-side client with:
- Environment-based URL configuration (sandbox vs production)
- Bearer token authentication
- Retry logic with exponential backoff
- Rate limit handling

Methods:
- `getItems()` - Fetch menu items with modifiers
- `getCategories()` - Fetch item categories
- `createAtomicOrder()` - Submit order to Clover
- `createCharge()` - Process payment
- `triggerPrint()` - Send order to kitchen printer

### 2.3 Create Clover Service Layer

**New File**: `src/lib/clover/service.ts`

Business logic:
- `syncMenuFromClover()` - Sync menu to local database
- `mapCartToCloverOrder()` - Transform cart to Clover format
- `submitOrderWithPayment()` - Full order flow

---

## Phase 3: API Routes

### 3.1 API Route Structure

```
app/api/
├── clover/
│   ├── menu/
│   │   └── sync/route.ts       # POST: Admin-triggered menu sync
│   ├── orders/
│   │   └── route.ts            # POST: Create order in Clover
│   ├── payments/
│   │   └── charge/route.ts     # POST: Process payment with token
│   └── webhooks/
│       └── route.ts            # POST: Receive Clover webhooks
└── orders/
    └── route.ts                # POST: Create local order
```

### 3.2 Key Route Implementations

**`/api/clover/orders/route.ts`** - Order Creation
1. Validate request body with Zod
2. Create local order in Prisma database
3. Map cart items to Clover line items
4. Add **"[WEB ORDER]"** prefix to order note
5. Submit atomic order to Clover API
6. Trigger kitchen print
7. Return order confirmation with `cloverOrderId`

**`/api/clover/payments/charge/route.ts`** - Payment Processing
1. Receive tokenized card (`clv_xxx`) from iframe
2. Validate amount matches order
3. Create charge via Clover Ecommerce API
4. Use idempotency key to prevent duplicates
5. Update order with payment status

**`/api/clover/webhooks/route.ts`** - Webhook Handler
1. Validate `X-Clover-Auth` signature
2. Parse webhook payload
3. Update local order status on changes

---

## Phase 4: Menu Synchronization

### 4.1 Sync Flow

Since Clover Dashboard is the source of truth:

1. Fetch all items from Clover: `GET /v3/merchants/{mId}/items?expand=modifierGroups.modifiers`
2. Fetch categories: `GET /v3/merchants/{mId}/categories`
3. Upsert to local Prisma database
4. Map `cloverItemId`, `cloverGroupId`, `cloverModId`

### 4.2 Database Schema Addition

**File**: `prisma/schema.prisma` - Add sync tracking:

```prisma
model SyncLog {
  id             String   @id @default(cuid())
  syncType       String   // 'MENU' | 'ORDER'
  status         String   // 'SUCCESS' | 'FAILED'
  itemsProcessed Int
  errors         Json?
  createdAt      DateTime @default(now())
}
```

---

## Phase 5: Payment Integration

### 5.1 Clover Payment Form Component

**New File**: `src/components/checkout/CloverPaymentForm.tsx`

Client-side component that:
1. Dynamically loads Clover SDK script
2. Initializes with public PAKMS API key
3. Mounts secure iframe card inputs
4. Handles tokenization on submit
5. Sends token to server for charge

### 5.2 Payment Flow

```
Customer → Checkout Form → Create Local Order
                              ↓
                        Show Payment Form
                              ↓
                        Enter Card (Iframe)
                              ↓
                        createToken() → clv_xxx
                              ↓
                        POST /api/clover/payments/charge
                              ↓
                        Server charges via Clover API
                              ↓
                        Submit order to Clover
                              ↓
                        Trigger kitchen print
                              ↓
                        Show confirmation
```

---

## Phase 6: Kitchen Printing with Web Order Distinction

### 6.1 Order Note Format

When creating atomic order, format note to clearly identify web orders:

```typescript
const cloverOrder = {
  note: `══════ WEB ORDER ══════\n` +
        `Customer: ${firstName} ${lastName}\n` +
        `Phone: ${phone}\n` +
        `Pickup: ${pickupTime}\n` +
        `═══════════════════════`,
  orderCart: {
    lineItems: items.map(item => ({
      item: { id: item.cloverItemId },
      name: item.name,
      price: item.totalPrice * 100, // cents
      printed: false,
      note: specialInstructions || undefined,
      modifications: item.modifiers
    }))
  }
};
```

### 6.2 Print Trigger

After order creation, call print API:
```
POST /v3/merchants/{mId}/print_event
{
  "orderRef": { "id": "{orderId}" }
}
```

---

## Phase 7: Update Checkout Flow

### 7.1 Modify Order Page

**File**: `app/order/page.tsx`

Replace `handleCheckoutSubmit` (currently logs to console) with:

1. Validate form
2. Create local order via `/api/orders`
3. Show `CloverPaymentForm` modal
4. On payment success, show confirmation
5. Clear cart

### 7.2 New State Management

Add to order page:
```typescript
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
const [paymentProcessing, setPaymentProcessing] = useState(false);
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/types/clover.ts` | TypeScript interfaces for Clover API |
| `src/lib/clover/client.ts` | Server-side Clover API client |
| `src/lib/clover/service.ts` | Business logic for Clover operations |
| `src/lib/clover/menuSync.ts` | Menu synchronization logic |
| `app/api/orders/route.ts` | Local order creation endpoint |
| `app/api/clover/orders/route.ts` | Clover order submission |
| `app/api/clover/payments/charge/route.ts` | Payment processing |
| `app/api/clover/menu/sync/route.ts` | Menu sync trigger |
| `app/api/clover/webhooks/route.ts` | Webhook handler |
| `src/components/checkout/CloverPaymentForm.tsx` | Payment form component |

## Files to Modify

| File | Changes |
|------|---------|
| `next.config.ts` | Remove `output: 'export'` |
| `netlify.toml` | Update for Next.js Runtime, change publish to `.next` |
| `package.json` | Add `@netlify/plugin-nextjs` dev dependency |
| `.env.example` | Add new Clover variables |
| `prisma/schema.prisma` | Add `SyncLog` model |
| `app/order/page.tsx` | Replace checkout handler, add payment modal |
| `src/store/cartStore.ts` | Add `cloverItemId` to cart items |

---

## Implementation Order

1. **Phase 1**: Configuration changes (next.config.ts, env vars)
2. **Phase 2**: Type definitions and Clover client
3. **Phase 3**: API routes structure
4. **Phase 4**: Menu sync (test with sandbox)
5. **Phase 5**: Payment form component
6. **Phase 6**: Order submission with printing
7. **Phase 7**: Update checkout flow
8. **Testing**: End-to-end with sandbox

---

## Security Checklist

- [ ] `CLOVER_ACCESS_TOKEN` has no `NEXT_PUBLIC_` prefix
- [ ] All Clover API calls in API routes only (server-side)
- [ ] Webhook signature validation implemented
- [ ] Card data never touches our server (iframe tokenization)
- [ ] Idempotency keys prevent duplicate charges
- [ ] Input validation with Zod on all endpoints
- [ ] `.env.local` in `.gitignore`
