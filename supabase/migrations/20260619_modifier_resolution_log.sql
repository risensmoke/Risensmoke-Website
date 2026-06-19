-- Modifier resolution log — early-warning signal for missing sides/meats.
-- A row is written at checkout whenever the cart arrived with catalog modifiers
-- that had a missing/stale cloverModId and the server re-resolved them before
-- submitting to Clover. Query by order_number when the kitchen reports a bare
-- ticket. See app/api/clover/payments/charge/route.ts.
CREATE TABLE IF NOT EXISTS modifier_resolution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_order_id UUID,
  order_number TEXT,
  customer_name TEXT,
  patched_count INTEGER NOT NULL DEFAULT 0,
  unresolved_count INTEGER NOT NULL DEFAULT 0,
  details JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modres_order_number ON modifier_resolution_log(order_number);
CREATE INDEX IF NOT EXISTS idx_modres_created_at ON modifier_resolution_log(created_at);
CREATE INDEX IF NOT EXISTS idx_modres_unresolved ON modifier_resolution_log(unresolved_count);

ALTER TABLE modifier_resolution_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service role" ON modifier_resolution_log;
CREATE POLICY "Allow all for service role" ON modifier_resolution_log FOR ALL USING (true);
