ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS final_report_proposal jsonb,
  ADD COLUMN IF NOT EXISTS final_report_proposal_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS final_report_proposal_updated_at timestamptz;
