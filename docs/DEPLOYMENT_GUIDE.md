# Rise N' Smoke - Production Deployment Guide

## Overview

This guide covers deploying the Rise N' Smoke online ordering application to production, including Clover POS integration, Supabase database, and hosting setup.

---

## Pre-Deployment Checklist

- [ ] Clover production credentials obtained
- [ ] Supabase production project created
- [ ] Hosting platform selected (Vercel recommended)
- [ ] Domain configured
- [ ] SSL certificate active

---

## Step 1: Clover Production Setup

### 1.1 Get Production Credentials

From your **Clover Merchant Dashboard** (https://www.clover.com/dashboard):

1. **Merchant ID**
   - Go to: Account & Setup > Business Information
   - Copy your Merchant ID

2. **API Access Token**
   - Go to: Account & Setup > API Tokens
   - Create a new token with the following permissions:
     - Orders (Read/Write)
     - Payments (Read/Write)
     - Customers (Read/Write)
     - Inventory (Read)
   - Copy the generated token

3. **Ecommerce API Keys**
   - Go to: Account & Setup > Ecommerce
   - Generate or copy your:
     - **Public Key (PAKMS)** - for frontend tokenization
     - **Private Key** - for backend charge processing

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
NEXT_PUBLIC_CLOVER_API_KEY=your_production_pakms_public_key
NEXT_PUBLIC_CLOVER_SDK_URL=https://checkout.clover.com/sdk.js

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

The menu data is stored in `data/menu-data.json` and includes:
- 8 Categories
- 8 Modifier Groups
- 44 Menu Items

### 4.2 Clover Menu Sync

The application reads menu data from the local JSON file. If you need to sync with Clover's inventory:

1. **Option A: Use Local Menu** (Recommended)
   - Menu is managed in `data/menu-data.json`
   - Update this file to change menu items
   - No Clover sync required

2. **Option B: Sync from Clover**
   - Use the menu export utility: `src/lib/clover/menuExport.ts`
   - Run sync to pull items from Clover inventory

### 4.3 Menu Data Structure

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

## Step 5: Deploy to Vercel

### 5.1 Connect Repository

1. Go to https://vercel.com
2. Import your GitHub repository
3. Select the `risensmoke-app` project

### 5.2 Configure Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5.3 Add Environment Variables

In Vercel Dashboard > Settings > Environment Variables:

1. Add all production environment variables from Step 3
2. Set them for **Production** environment
3. Optionally set different values for **Preview** (sandbox credentials)

### 5.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment at the generated URL

---

## Step 6: Domain Configuration

### 6.1 Add Custom Domain

In Vercel Dashboard > Settings > Domains:

1. Add your domain: `order.risensmoke.com`
2. Configure DNS records as instructed:
   - **CNAME**: `order` → `cname.vercel-dns.com`
   - Or **A Record**: `@` → Vercel IP

### 6.2 SSL Certificate

Vercel automatically provisions SSL certificates for custom domains.

---

## Step 7: Post-Deployment Verification

### 7.1 Test Checklist

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

### 7.2 Test Card Numbers

For Clover sandbox testing:
| Card | Number | CVV | Expiry |
|------|--------|-----|--------|
| Visa | 4111 1111 1111 1111 | 123 | Any future date |
| Mastercard | 5500 0000 0000 0004 | 123 | Any future date |
| Amex | 3400 0000 0000 009 | 1234 | Any future date |

**Note**: In production, use real cards for testing (small amounts, then refund).

---

## Step 8: Monitoring & Maintenance

### 8.1 Error Monitoring

Consider adding:
- Vercel Analytics (built-in)
- Sentry for error tracking
- LogRocket for session replay

### 8.2 Database Backups

Supabase provides automatic daily backups on paid plans.

### 8.3 Updates

To deploy updates:
1. Push changes to main branch
2. Vercel automatically rebuilds and deploys

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Payment form not loading | Check `NEXT_PUBLIC_CLOVER_API_KEY` and `NEXT_PUBLIC_CLOVER_SDK_URL` |
| Orders not appearing in Clover | Verify `CLOVER_MERCHANT_ID` and `CLOVER_ACCESS_TOKEN` |
| Payment succeeds but not linked to order | Ensure using production Ecommerce API URL |
| Customer not created | Check API token has Customers permission |
| Database connection failed | Verify Supabase URL and keys |

### Support Contacts

- **Clover Support**: https://www.clover.com/support
- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support

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
