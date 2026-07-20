ALTER TABLE catalog_reprocess_requests
  DROP CONSTRAINT IF EXISTS catalog_reprocess_requests_status_check;

UPDATE catalog_reprocess_requests
SET status = 'completed'
WHERE status = 'done';

ALTER TABLE catalog_reprocess_requests
  ADD CONSTRAINT catalog_reprocess_requests_status_check
  CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

ALTER TABLE catalog_reprocess_requests
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS result_json jsonb,
  ADD COLUMN IF NOT EXISTS error_json jsonb;
