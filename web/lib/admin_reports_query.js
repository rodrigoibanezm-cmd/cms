import { query } from './db.js';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;

function clean(value) {
  return String(value || '').trim();
}

function positiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export function pageParams(searchParams) {
  const limit = Math.min(
    positiveInt(searchParams.get('limit'), DEFAULT_LIMIT),
    MAX_LIMIT
  );
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);
  return { limit, offset };
}

export function whereClause(searchParams, tenantId) {
  const clauses = ['r.tenant_id = $1'];
  const params = [tenantId];
  const filters = {
    status: clean(searchParams.get('status')),
    review_status: clean(searchParams.get('review_status')),
    semaforo: clean(searchParams.get('semaforo')),
  };
  for (const [field, value] of Object.entries(filters)) {
    if (!value) continue;
    params.push(value);
    clauses.push(`r.${field} = $${params.length}`);
  }
  const q = clean(searchParams.get('q'));
  if (q) {
    params.push(`%${q}%`);
    clauses.push(`(r.ot ILIKE $${params.length} OR r.source_name ILIKE $${params.length})`);
  }
  return { sql: `WHERE ${clauses.join(' AND ')}`, params };
}

const reportSelect = `
  r.id, r.ot, r.source_name, r.status, r.review_status,
  r.current_state, r.current_owner_type, r.current_owner_id,
  r.semaforo, r.confidence_score, r.template_filename,
  r.excel_url, r.drive_file_id, r.approved_at, r.rejected_at,
  r.error_message, r.created_at, r.updated_at,
  count(f.id)::int AS file_count,
  count(f.id) FILTER (WHERE f.kind = 'original_report')::int AS original_count,
  count(f.id) FILTER (WHERE f.kind = 'detail_photo')::int AS photo_count,
  count(f.id) FILTER (WHERE f.kind = 'generated_xls')::int AS xls_count
`;

export async function countReports(where) {
  const res = await query(
    `SELECT count(*)::int AS total FROM reports r ${where.sql}`,
    where.params
  );
  return res.rows[0]?.total || 0;
}

export async function listReports(where, page) {
  const res = await query(
    `SELECT ${reportSelect}
     FROM reports r
     LEFT JOIN report_files f ON f.report_id = r.id
     ${where.sql}
     GROUP BY r.id
     ORDER BY r.created_at DESC
     LIMIT $${where.params.length + 1}
     OFFSET $${where.params.length + 2}`,
    [...where.params, page.limit, page.offset]
  );
  return res.rows;
}
