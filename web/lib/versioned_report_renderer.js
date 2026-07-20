import { randomUUID } from 'crypto';
import { createRequire } from 'module';
import { db, query } from './db.js';
import { ensureReportSchema } from './report_store.js';
import { verifyCatalogHash, withTransaction } from './versioned_renderer_runtime.mjs';
import { generateFinalXls } from './xls_generator.js';

const { stringify } = createRequire(import.meta.url)('../../catalog/compiler/compiler.js');
const XLS_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function normalizeAlias(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim().replace(/\s+/g, ' ').toUpperCase();
}
function getPath(context, path) {
  return path.split('.').reduce((value, key) => value?.[key], context);
}
export function selectCertifiedFamily(catalog, context) {
  const matches = Object.entries(catalog.families || {}).filter(([, family]) => {
    const candidate = normalizeAlias(getPath(context, family.classifier.source_field));
    return family.aliases.includes(candidate);
  });
  if (matches.length !== 1) throw new Error(`Certified family resolution produced ${matches.length} matches`);
  return { key: matches[0][0], contract: matches[0][1] };
}

async function loadInputs(reportId, catalogVersionId) {
  const [reportResult, catalogResult] = await Promise.all([
    query('SELECT * FROM reports WHERE id=$1', [reportId]),
    query(`SELECT id, version, compiled_catalog, catalog_hash
      FROM catalog_versions WHERE id=$1`, [catalogVersionId]),
  ]);
  const report = reportResult.rows[0];
  const catalogVersion = catalogResult.rows[0];
  if (!report) throw new Error('OT no encontrada');
  if (!report.extraction_json) throw new Error('OT sin extracción');
  if (!catalogVersion) throw new Error('Catalog version not found');
  verifyCatalogHash(catalogVersion.compiled_catalog, catalogVersion.catalog_hash, stringify);
  return { report, catalogVersion };
}

async function persistResult({ report, catalogVersion, familyKey, contract, xls }) {
  const payload = JSON.stringify({
    catalog_version_id: catalogVersion.id, catalog_version: catalogVersion.version,
    catalog_hash: catalogVersion.catalog_hash, family: familyKey, generated_xls: xls.filename,
  });
  await withTransaction(db(), async (client) => {
    await client.query(`UPDATE reports SET template_key=$2, template_filename=$3,
      excel_url=$4, drive_file_id=$5, status='processed', updated_at=now() WHERE id=$1`,
    [report.id, familyKey, contract.template_reference.filename, xls.excel_url, xls.drive_file_id]);
    await client.query(`INSERT INTO report_files
      (id, tenant_id, report_id, kind, filename, mime_type, drive_file_id, url)
      VALUES ($1, COALESCE($2, (SELECT tenant_id FROM reports WHERE id=$3)),
        $3, 'generated_xls', $4, $5, $6, $7)`,
    [randomUUID(), report.tenant_id, report.id, xls.filename, XLS_MIME, xls.drive_file_id, xls.excel_url]);
    await client.query(`INSERT INTO report_events
      (id, tenant_id, report_id, event, payload_json)
      VALUES ($1, COALESCE($2, (SELECT tenant_id FROM reports WHERE id=$3)),
        $3, 'versioned_xls_rendered', $4)`,
    [randomUUID(), report.tenant_id, report.id, payload]);
  });
}

export async function renderReport({ reportId, catalogVersionId }) {
  if (!reportId) throw new Error('reportId is required');
  if (!catalogVersionId) throw new Error('catalogVersionId is required');
  await ensureReportSchema();
  const { report, catalogVersion } = await loadInputs(reportId, catalogVersionId);
  const family = selectCertifiedFamily(catalogVersion.compiled_catalog,
    { report, extraction: report.extraction_json });
  const extraction = {
    ...report.extraction_json, report, template_key: family.key,
    template_filename: family.contract.template_reference.filename,
    template_drive_file_id: family.contract.template_reference.drive_file_id,
  };
  const xls = await generateFinalXls({
    extraction, photos: [], publish: true, renderContract: family.contract,
  });
  await persistResult({ report, catalogVersion, familyKey: family.key, contract: family.contract, xls });
  return { reportId, catalogVersionId, family: family.key, xls };
}
