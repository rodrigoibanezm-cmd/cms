CREATE TABLE IF NOT EXISTS catalog_versions (
  id uuid PRIMARY KEY,
  version text NOT NULL UNIQUE CHECK (btrim(version) <> ''),
  parent_version text,
  status text NOT NULL CHECK (status IN ('registered', 'active', 'superseded')),
  compiled_catalog jsonb NOT NULL,
  manifest jsonb NOT NULL,
  catalog_hash text NOT NULL CHECK (catalog_hash ~ '^[0-9a-f]{64}$'),
  decisions_hash text NOT NULL CHECK (decisions_hash ~ '^[0-9a-f]{64}$'),
  compiler_version text NOT NULL CHECK (btrim(compiler_version) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  superseded_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_versions_single_active
  ON catalog_versions ((status)) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS catalog_reprocess_requests (
  id uuid PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES reports(id),
  catalog_version_id uuid NOT NULL REFERENCES catalog_versions(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_id, catalog_version_id)
);

CREATE INDEX IF NOT EXISTS idx_catalog_reprocess_pending
  ON catalog_reprocess_requests(status, created_at);

CREATE OR REPLACE FUNCTION activate_catalog_version(
  p_id uuid,
  p_version text,
  p_parent_version text,
  p_compiled_catalog jsonb,
  p_manifest jsonb,
  p_catalog_hash text,
  p_decisions_hash text,
  p_compiler_version text,
  p_report_ids uuid[]
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  current_active catalog_versions%ROWTYPE;
  target catalog_versions%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('catalog_activation'));

  SELECT * INTO current_active
  FROM catalog_versions
  WHERE status = 'active';

  IF current_active.version = p_version THEN
    IF current_active.catalog_hash <> p_catalog_hash
      OR current_active.decisions_hash <> p_decisions_hash
      OR current_active.compiler_version <> p_compiler_version THEN
      RAISE EXCEPTION 'active version payload mismatch';
    END IF;
    RETURN current_active.id;
  END IF;

  IF current_active.id IS NULL AND p_parent_version IS NOT NULL THEN
    RAISE EXCEPTION 'first activation cannot declare parent_version';
  END IF;
  IF current_active.id IS NOT NULL AND p_parent_version IS DISTINCT FROM current_active.version THEN
    RAISE EXCEPTION 'parent_version must match active version';
  END IF;

  INSERT INTO catalog_versions (
    id, version, parent_version, status, compiled_catalog, manifest,
    catalog_hash, decisions_hash, compiler_version
  ) VALUES (
    p_id, p_version, p_parent_version, 'registered', p_compiled_catalog, p_manifest,
    p_catalog_hash, p_decisions_hash, p_compiler_version
  ) ON CONFLICT (version) DO NOTHING;

  SELECT * INTO target FROM catalog_versions WHERE version = p_version FOR UPDATE;
  IF target.catalog_hash <> p_catalog_hash
    OR target.decisions_hash <> p_decisions_hash
    OR target.compiler_version <> p_compiler_version
    OR target.compiled_catalog <> p_compiled_catalog
    OR target.manifest <> p_manifest THEN
    RAISE EXCEPTION 'registered version payload mismatch';
  END IF;

  UPDATE catalog_versions
  SET status = 'superseded', superseded_at = now()
  WHERE status = 'active';

  UPDATE catalog_versions
  SET status = 'active', activated_at = COALESCE(activated_at, now())
  WHERE id = target.id;

  INSERT INTO catalog_reprocess_requests (id, report_id, catalog_version_id)
  SELECT gen_random_uuid(), report_id, target.id
  FROM unnest(COALESCE(p_report_ids, ARRAY[]::uuid[])) AS report_id
  ON CONFLICT (report_id, catalog_version_id) DO NOTHING;

  RETURN target.id;
END;
$$;
