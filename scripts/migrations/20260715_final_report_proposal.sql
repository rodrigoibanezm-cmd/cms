ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS final_report_proposal jsonb,
  ADD COLUMN IF NOT EXISTS final_report_proposal_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS final_report_proposal_model text,
  ADD COLUMN IF NOT EXISTS final_report_proposal_spec_version text,
  ADD COLUMN IF NOT EXISTS final_report_proposal_source_file_id uuid;
