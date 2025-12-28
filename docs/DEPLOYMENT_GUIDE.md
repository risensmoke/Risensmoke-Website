# Rise N' Smoke - Production Deployment Guide

## Overview

This guide covers deploying the Rise N' Smoke online ordering application to production, including Clover POS integration, Supabase database, and hosting setup.

---

## Pre-Deployment Checklist

- [ ] Clover production credentials obtained
- [ ] Supabase production project created
- [ ] Netlify account created
- [ ] Clover ID export script run for production
- [ ] Domain configured
- [ ] SSL certificate active

---

## Step 1: Clover Production Setup

### Important: Production vs Sandbox

**Production is simpler than Sandbox!**

In sandbox, you deal with Developer Accounts, Apps, and Test Merchants that must be linked together. In production, there's just your **Merchant Account** - no separate "App" to install or configure.

Since you already have a working Clover merchant account accepting counter payments, you just need to:
1. Enable Ecommerce on your existing merchant
2. Get the API credentials
3. Configure the allowed Site URL

### 1.1 Get Production Credentials

Log into your **Clover Merchant Dashboard** at https://www.clover.com/dashboard

#### A. Merchant ID
- Look at your browser URL when logged in: `clover.com/dashboard/m/XXXXXXXXXXXX`
- The `XXXXXXXXXXXX` is your Merchant ID
- Or go to: **Account & Setup** > **Business Information**

#### B. REST API Access Token
This token is used for orders, customers, inventory, and print functions.

1. Go to: **Account & Setup** > **API Tokens**
2. Click **"Create new token"** (or use existing if one exists)
3. Set permissions:
   - **Customers**: Read & Write
   - **Inventory**: Read & Write
   - **Orders**: Read & Write
   - **Payments**: Read & Write
4. Copy the generated token (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

#### C. Ecommerce API Keys (for Online Payments)
These keys are used for credit card tokenization and charging.

1. Go to: **Account & Setup** > **Ecommerce** > **API Tokens**
   - Or navigate to: **Setup** > **Ecommerce** in the left menu
2. If no token exists, click **"Create new token"** with Integration type: **IFRAME**
3. Copy both keys:
   - **Public Token** - 32 character hex string (for frontend iframe tokenization)
   - **Private Token** - UUID format (for backend charge processing)

#### D. Configure Site URL (REQUIRED for Payment Iframe)
The Clover payment iframe will only work on whitelisted domains.

1. Go to: **Account & Setup** > **Ecommerce** > **Hosted Checkout** (or similar)
2. Look for **Site URL** or **Allowed Origins** setting
3. Add your production domain: `https://risensmoke.com` (or `https://order.risensmoke.com`)
4. Save changes

**Note**: Without the correct Site URL configured, the payment form will fail to tokenize cards.

### 1.2 Production API URLs

| Environment | REST API | Ecommerce API | SDK URL |
|-------------|----------|---------------|---------|
| **Sandbox** | `https://sandbox.dev.clover.com` | `https://scl-sandbox.dev.clover.com` | `https://checkout.sandbox.dev.clover.com/sdk.js` |
| **Production** | `https://api.clover.com` | `https://scl.clover.com` | `https://checkout.clover.com/sdk.js` |

---

## Step 2: Supabase Production Setup

### 2.1 Create Production Project

1. Go to https://app.supabase.com
2. Create a new project for production
3. Note your project credentials:
   - Project URL
   - Anon (public) key
   - Service role key (keep secret!)

### 2.2 Run Database Schema

In Supabase Dashboard > SQL Editor, run the schema from `supabase/schema.sql`:

```sql
-- Rise N' Smoke Database Schema for Supabase

-- Users table (for NextAuth credentials)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  clover_order_id TEXT,
  user_id UUID REFERENCES users(id),
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  estimated_ready TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'CANCELLED')),
  payment_intent_id TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  modifiers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all for service role" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON order_items FOR ALL USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Step 3: Environment Variables

### 3.1 Required Production Variables

Create these environment variables in your hosting platform:

```bash
# ===========================================
# PRODUCTION ENVIRONMENT VARIABLES
# ===========================================

# App Configuration
NEXT_PUBLIC_SITE_URL=https://order.risensmoke.com
NEXT_PUBLIC_APP_NAME="Rise N' Smoke"

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Authentication
NEXTAUTH_URL=https://order.risensmoke.com
NEXTAUTH_SECRET=generate_a_secure_random_string_here
JWT_SECRET=generate_another_secure_random_string_here

# ===========================================
# CLOVER PRODUCTION CREDENTIALS
# ===========================================

# Clover REST API (Production)
CLOVER_API_BASE_URL=https://api.clover.com
CLOVER_MERCHANT_ID=your_production_merchant_id
CLOVER_ACCESS_TOKEN=your_production_oauth_access_token

# Clover Ecommerce API (Production)
CLOVER_ECOM_BASE_URL=https://scl.clover.com
CLOVER_ECOM_PRIVATE_KEY=your_production_ecom_private_key

# Clover Frontend SDK (Production)
# Note: NEXT_PUBLIC_CLOVER_MERCHANT_ID should match CLOVER_MERCHANT_ID
NEXT_PUBLIC_CLOVER_API_KEY=your_production_pakms_public_key
NEXT_PUBLIC_CLOVER_SDK_URL=https://checkout.clover.com/sdk.js
NEXT_PUBLIC_CLOVER_MERCHANT_ID=your_production_merchant_id

# ===========================================
# BUSINESS CONFIGURATION
# ===========================================

# Tax Rate (8% for Texas)
TAX_RATE=0.08

# Order Timing
DEFAULT_PREP_TIME_MINUTES=30
MAX_ORDER_DAYS_AHEAD=7
MIN_ORDER_MINUTES_AHEAD=60

# Business Info
BUSINESS_NAME="Rise N' Smoke"
BUSINESS_ADDRESS="401 Abbott Avenue, Hillsboro Texas 76645"
BUSINESS_PHONE="(254) 221-6247"
BUSINESS_EMAIL="order@risensmoke.com"
```

### 3.2 Generate Secure Secrets

Generate secure random strings for NEXTAUTH_SECRET and JWT_SECRET:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 4: Menu Data Import

### 4.1 Menu Data File

The menu data is stored in `src/data/menu-data.json` and includes:
- 8 Categories
- 8 Modifier Groups
- 44 Menu Items

### 4.2 Menu Data Structure

```json
{
  "categories": [
    { "id": "blessed-plates", "name": "Blessed Plates", "sortOrder": 1 }
  ],
  "modifierGroups": [
    {
      "id": "meat-selection",
      "name": "Meat Selection",
      "required": false,
      "modifiers": [
        { "id": "sliced-brisket", "name": "Sliced Brisket", "price": 0 }
      ]
    }
  ],
  "items": [
    {
      "id": "gospel-plate",
      "name": "Gospel Plate",
      "description": "Mini gospel truth about the smoke",
      "price": 12.50,
      "categoryId": "blessed-plates",
      "available": true,
      "modifierGroupIds": ["meat-selection", "side-selection", "condiments"]
    }
  ]
}
```

---

## Step 5: Clover ID Synchronization (REQUIRED)

**This step is critical for orders to display correctly in Clover with all modifiers and item details.**

### 5.1 How Clover IDs Work

When you import menu items into Clover, Clover assigns unique IDs to each item and modifier. The website needs these IDs to link orders correctly. Without them, orders will only show item names without the linked Clover inventory items.

### 5.2 The Synchronization Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Import Menu    │ ──► │  Clover Assigns │ ──► │  Export IDs     │
│  to Clover      │     │  Unique IDs     │     │  Back to App    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Orders Link    │ ◄── │  Website Uses   │ ◄── │  IDs Saved to   │
│  to Clover Items│     │  Clover IDs     │     │  Mapping File   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 5.3 Export Clover IDs After Menu Import

After importing your menu to Clover (either via dashboard or import script), run the export script to fetch the Clover-assigned IDs:

**For Sandbox (Testing):**
```bash
CLOVER_API_BASE_URL=https://sandbox.dev.clover.com \
CLOVER_MERCHANT_ID=your_sandbox_merchant_id \
CLOVER_ACCESS_TOKEN=your_sandbox_token \
npx ts-node scripts/export-clover-ids.ts
```

**For Production:**
```bash
CLOVER_API_BASE_URL=https://api.clover.com \
CLOVER_MERCHANT_ID=your_production_merchant_id \
CLOVER_ACCESS_TOKEN=your_production_token \
npx ts-node scripts/export-clover-ids.ts
```

### 5.4 Script Output

The script will:
1. Connect to your Clover merchant account
2. Fetch all categories, items, and modifiers with their Clover IDs
3. Match them to your local menu items by name
4. Generate a mapping file: `src/data/clover-mappings-{environment}.json`

Example output:
```
==================================================
Clover ID Export Script
==================================================
Environment: production
Merchant ID: XXXXXXXXXX

Fetching categories...
  Found 8 categories
Fetching modifier groups...
  Found 8 modifier groups
Fetching items...
  Found 44 items

Matching categories...
  ✓ Blessed Plates → VBC7HNG2EX0QG
  ✓ Sandwiches → K5Q39Q30N168R
  ...

Matching modifier groups and modifiers...
  ✓ Group: Meat Selection → BQ1M569SATSK0
    ✓ Sliced Brisket → Y5M2M26XQ52BW
    ✓ Chopped Brisket → JP2H237FDTFBW
    ...

Matching items...
  ✓ Gospel Plate → RAS2VBTDFM7CG
  ✓ Disciples Plate → SE0X2HYTM1WN2
  ...

==================================================
Export Complete!
==================================================
Categories matched: 8/8
Modifier groups matched: 8/8
Modifiers matched: 40
Items matched: 44/44

Output saved to: src/data/clover-mappings-production.json
```

### 5.5 Verify Before Deployment

After running the export:

1. **Check the mapping file** at `src/data/clover-mappings-production.json`
2. **Verify all items matched** - if any show "NOT FOUND", ensure names match exactly in Clover
3. **Commit the mapping file** to your repository
4. **Deploy** - the website will now use the correct Clover IDs

### 5.6 When to Re-Run Export

You must re-run the export script when:
- Adding new menu items to Clover
- Adding new modifiers to Clover
- Changing item/modifier names in Clover
- Switching from sandbox to production

---

## Step 6: Deploy to Netlify

### 6.1 Connect Repository

1. Go to https://app.netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect your GitHub account and select the `risensmoke-app` repository

### 6.2 Configure Build Settings

- **Base directory**: (leave blank)
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Functions directory**: `netlify/functions` (if using)

### 6.3 Install Next.js Plugin

Netlify requires the Next.js runtime plugin. Add to your `netlify.toml` (create if it doesn't exist):

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Install the plugin:
```bash
npm install -D @netlify/plugin-nextjs
```

### 6.4 Add Environment Variables

In Netlify Dashboard > Site settings > Environment variables:

1. Click "Add a variable"
2. Add all production environment variables from Step 3
3. Set the scope to **Production** (or All if you want same for deploy previews)

**Required variables:**
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `CLOVER_API_BASE_URL`
- `CLOVER_MERCHANT_ID`
- `CLOVER_ACCESS_TOKEN`
- `CLOVER_ECOM_BASE_URL`
- `CLOVER_ECOM_PRIVATE_KEY`
- `NEXT_PUBLIC_CLOVER_API_KEY`
- `NEXT_PUBLIC_CLOVER_SDK_URL`
- `NEXT_PUBLIC_CLOVER_MERCHANT_ID`

### 6.5 Deploy

1. Click "Deploy site"
2. Wait for build to complete (first build may take 2-5 minutes)
3. Verify deployment at the generated URL (e.g., `your-site-name.netlify.app`)

---

## Step 7: Domain Configuration

### 7.1 Add Custom Domain in Netlify

In Netlify Dashboard > Domain management:

1. Click "Add a domain"
2. Enter your domain: `order.risensmoke.com`
3. Configure DNS records as instructed:
   - **CNAME**: `order` → `your-site-name.netlify.app`
   - Or use Netlify DNS for automatic configuration

### 7.2 SSL Certificate

Netlify automatically provisions free SSL certificates via Let's Encrypt for custom domains.

---

## Step 8: Post-Deployment Verification

### 8.1 Test Checklist

- [ ] Homepage loads correctly
- [ ] Menu items display with correct prices
- [ ] Add items to cart works
- [ ] Checkout form submits
- [ ] Payment form loads (Clover SDK)
- [ ] Test payment processes successfully
- [ ] Order appears in Clover dashboard
- [ ] Customer created in Clover
- [ ] Receipt shows correct "Total paid"
- [ ] Order confirmation page displays

### 8.2 Test Card Numbers

For Clover sandbox testing:
| Card | Number | CVV | Expiry |
|------|--------|-----|--------|
| Visa | 4111 1111 1111 1111 | 123 | Any future date |
| Mastercard | 5500 0000 0000 0004 | 123 | Any future date |
| Amex | 3400 0000 0000 009 | 1234 | Any future date |

**Note**: In production, use real cards for testing (small amounts, then refund).

---

## Step 9: Monitoring & Maintenance

### 9.1 Error Monitoring

Consider adding:
- Netlify Analytics (available on paid plans)
- Sentry for error tracking
- LogRocket for session replay

### 9.2 Database Backups

Supabase provides automatic daily backups on paid plans.

### 9.3 Updates

To deploy updates:
1. Push changes to main branch
2. Netlify automatically rebuilds and deploys
3. View build logs in Netlify Dashboard > Deploys

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Payment form not loading | Check `NEXT_PUBLIC_CLOVER_API_KEY` and `NEXT_PUBLIC_CLOVER_SDK_URL` |
| "Failed to tokenize card" or empty `{}` response | Verify Site URL is configured in Clover Ecommerce settings (Step 1.1.D) |
| 401 Unauthorized on tokenization | Check `NEXT_PUBLIC_CLOVER_API_KEY` is correct and matches Ecommerce API public token |
| Orders not appearing in Clover | Verify `CLOVER_MERCHANT_ID` and `CLOVER_ACCESS_TOKEN` |
| Payment succeeds but not linked to order | Ensure using production Ecommerce API URL |
| Customer not created | Check API token has Customers permission |
| Database connection failed | Verify Supabase URL and keys |

### Support Contacts

- **Clover Support**: https://www.clover.com/support
- **Supabase Support**: https://supabase.com/support
- **Netlify Support**: https://www.netlify.com/support

---

## Quick Reference

### Sandbox vs Production URLs

| Service | Sandbox | Production |
|---------|---------|------------|
| Clover REST API | `sandbox.dev.clover.com` | `api.clover.com` |
| Clover Ecommerce | `scl-sandbox.dev.clover.com` | `scl.clover.com` |
| Clover SDK | `checkout.sandbox.dev.clover.com/sdk.js` | `checkout.clover.com/sdk.js` |

### Files to Update for Production

1. `.env.local` or hosting environment variables
2. No code changes needed - all URLs are in environment variables

---

## Appendix: Complete Environment Variables Template

```bash
# Copy this to your hosting platform's environment variables

# App
NEXT_PUBLIC_SITE_URL=https://order.risensmoke.com
NEXT_PUBLIC_APP_NAME="Rise N' Smoke"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth
NEXTAUTH_URL=https://order.risensmoke.com
NEXTAUTH_SECRET=your-32-char-secret
JWT_SECRET=your-32-char-secret

# Clover Production
CLOVER_API_BASE_URL=https://api.clover.com
CLOVER_ECOM_BASE_URL=https://scl.clover.com
CLOVER_MERCHANT_ID=XXXXXXXXXX
CLOVER_ACCESS_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
CLOVER_ECOM_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLOVER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLOVER_SDK_URL=https://checkout.clover.com/sdk.js
NEXT_PUBLIC_CLOVER_MERCHANT_ID=XXXXXXXXXX

# Business
TAX_RATE=0.08
DEFAULT_PREP_TIME_MINUTES=30
MAX_ORDER_DAYS_AHEAD=7
MIN_ORDER_MINUTES_AHEAD=60
BUSINESS_NAME="Rise N' Smoke"
BUSINESS_ADDRESS="401 Abbott Avenue, Hillsboro Texas 76645"
BUSINESS_PHONE="(254) 221-6247"
BUSINESS_EMAIL="order@risensmoke.com"
```
