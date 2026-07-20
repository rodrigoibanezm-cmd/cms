CREATE TABLE IF NOT EXISTS catalog_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text UNIQUE NOT NULL,
  previous_version text,
  change_type text NOT NULL CHECK (change_type IN ('BASELINE','MAJOR','MINOR','PATCH')),
  artifacts jsonb NOT NULL,
  artifacts_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type text NOT NULL CHECK (decision_type IN (
    'ASSOCIATE_EXISTING_FAMILY',
    'CREATE_FAMILY',
    'REJECT_INSUFFICIENT_INFORMATION'
  )),
  source_report_id uuid REFERENCES reports(id),
  source_ot text NOT NULL,
  family_key text,
  target_family_key text,
  aliases jsonb NOT NULL DEFAULT '[]'::jsonb,
  reason text NOT NULL,
  author_id uuid,
  status text NOT NULL DEFAULT 'ACCEPTED',
  catalog_version_created text REFERENCES catalog_versions(version),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid REFERENCES catalog_decisions(id),
  event_type text NOT NULL,
  success boolean NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS catalog_decision_one_active_per_report
ON catalog_decisions(source_report_id)
WHERE status = 'ACCEPTED';
