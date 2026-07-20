CREATE OR REPLACE FUNCTION catalog_nonblank_text_array(values_to_check text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT values_to_check IS NULL OR (
    cardinality(values_to_check) > 0
    AND NOT EXISTS (
      SELECT 1 FROM unnest(values_to_check) AS value WHERE btrim(value) = ''
    )
  );
$$;

CREATE OR REPLACE FUNCTION catalog_nonblank_jsonb_string_array(values_to_check jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT jsonb_typeof(values_to_check) = 'array'
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(values_to_check) AS element
      WHERE jsonb_typeof(element) <> 'string'
        OR btrim(element #>> '{}') = ''
    );
$$;

CREATE TABLE IF NOT EXISTS catalog_decisions (
  id uuid PRIMARY KEY,
  decision_type text NOT NULL CHECK (decision_type IN (
    'ASSOCIATE_ALIAS', 'CREATE_FAMILY', 'REJECT_INSUFFICIENT_EVIDENCE'
  )),
  source_report_id uuid NOT NULL REFERENCES reports(id),
  source_ot text NOT NULL CHECK (btrim(source_ot) <> ''),
  source_filename text NOT NULL CHECK (btrim(source_filename) <> ''),
  evidence jsonb NOT NULL CHECK (
    jsonb_typeof(evidence) = 'object'
    AND evidence ?& ARRAY['report_ids', 'filenames', 'observations']
    AND (evidence - ARRAY['report_ids', 'filenames', 'observations']) = '{}'::jsonb
    AND catalog_nonblank_jsonb_string_array(evidence->'report_ids')
    AND catalog_nonblank_jsonb_string_array(evidence->'filenames')
    AND catalog_nonblank_jsonb_string_array(evidence->'observations')
    AND jsonb_array_length(evidence->'report_ids')
      + jsonb_array_length(evidence->'filenames')
      + jsonb_array_length(evidence->'observations') > 0
    AND (
      evidence->'report_ids' @> to_jsonb(ARRAY[source_report_id::text])
      OR evidence->'filenames' @> to_jsonb(ARRAY[source_filename])
    )
  ),
  reason text NOT NULL CHECK (btrim(reason) <> ''),
  created_by text NOT NULL CHECK (btrim(created_by) <> ''),
  created_at timestamptz NOT NULL,
  target_family text,
  alias text,
  aliases text[],
  CHECK (target_family IS NULL OR btrim(target_family) <> ''),
  CHECK (alias IS NULL OR btrim(alias) <> ''),
  CHECK (catalog_nonblank_text_array(aliases)),
  CHECK (
    (decision_type = 'ASSOCIATE_ALIAS'
      AND alias IS NOT NULL AND target_family IS NOT NULL AND aliases IS NULL)
    OR
    (decision_type = 'CREATE_FAMILY'
      AND target_family IS NOT NULL AND NOT (alias IS NOT NULL AND aliases IS NOT NULL))
    OR
    (decision_type = 'REJECT_INSUFFICIENT_EVIDENCE'
      AND alias IS NULL AND aliases IS NULL AND target_family IS NULL)
  )
);

COMMENT ON COLUMN catalog_decisions.created_by IS
  'Immutable textual identity snapshot; no stable relational user table exists in the current system.';

CREATE INDEX IF NOT EXISTS idx_catalog_decisions_source_report
  ON catalog_decisions(source_report_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalog_decisions_source_ot
  ON catalog_decisions(source_ot, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalog_decisions_target_family
  ON catalog_decisions(target_family, created_at DESC);

CREATE OR REPLACE FUNCTION reject_catalog_decision_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'catalog_decisions is append-only';
END;
$$;

DROP TRIGGER IF EXISTS catalog_decisions_append_only ON catalog_decisions;
CREATE TRIGGER catalog_decisions_append_only
BEFORE UPDATE OR DELETE ON catalog_decisions
FOR EACH ROW EXECUTE FUNCTION reject_catalog_decision_mutation();
