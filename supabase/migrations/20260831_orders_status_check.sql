-- Allow the new checkout statuses (PENDING_PAYMENT, PAYMENT_FAILED) introduced
-- alongside checkout_failure_log. The original orders_status_check predates
-- them and rejects the new inserts, which would break order creation.
-- NOT VALID: only new writes are checked, so any legacy status values already
-- in the table cannot block the migration.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'PENDING_PAYMENT',
    'PAYMENT_FAILED',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'PICKED_UP',
    'CANCELLED'
  )
) NOT VALID;
