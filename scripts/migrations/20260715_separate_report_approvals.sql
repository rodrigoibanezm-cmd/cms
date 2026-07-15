ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS transcription_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS final_report_approved_at timestamptz;

UPDATE reports
SET transcription_approved_at = COALESCE(secretary_approved_at, approved_at)
WHERE transcription_approved_at IS NULL
  AND (secretary_approved_at IS NOT NULL OR approved_at IS NOT NULL);
