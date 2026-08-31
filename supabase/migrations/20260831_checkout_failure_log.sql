-- Checkout failure log — records every failed charge attempt so declines,
-- crashes, and abandonment stop being indistinguishable. A row is written from
-- the charge route's error handler (best-effort, never blocks the response).
-- Research 2026-08-31: 17-57% of order rows per month never converted, with
-- zero recorded evidence of why. See app/api/clover/payments/charge/route.ts.
CREATE TABLE IF NOT EXISTS checkout_failure_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_order_id UUID,
  order_number TEXT,
  customer_name TEXT,
  total NUMERIC,
  stage TEXT,                    -- 'clover_order_create' | 'payment' | 'unknown'
  status_code INTEGER,           -- HTTP status from Clover, when available
  error_name TEXT,
  error_message TEXT,
  clover_error JSONB,            -- raw Clover error body, when available
  leaked_clover_order_id TEXT,   -- set when the unpaid Clover order could not be deleted
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cfl_order_number ON checkout_failure_log(order_number);
CREATE INDEX IF NOT EXISTS idx_cfl_created_at ON checkout_failure_log(created_at);
CREATE INDEX IF NOT EXISTS idx_cfl_stage ON checkout_failure_log(stage);

ALTER TABLE checkout_failure_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service role" ON checkout_failure_log;
CREATE POLICY "Allow all for service role" ON checkout_failure_log FOR ALL USING (true);
