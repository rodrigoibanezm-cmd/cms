import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import { ensureReportSchema } from '../../../../lib/report_store.js';

export const runtime = 'nodejs';

const MAX_LIMIT = 100;

function clean(value) {
  return String(value || '').trim();
}

function pageParams(searchParams) {
  const limit = Math.min(Number(searchParams.get('limit')) || 25, MAX_LIMIT);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);
  return { limit, offset };
}

function whereClause(searchParams) {
  const clauses = [];
  const params = [];

  const status = clean(searchParams.get('status'));
  const reviewStatus = clean(searchParams.get('review_status'));
  const semaforo = clean(searchParams.get('semaforo'));
  const q = clean(searchParams.get('q'));

  if (status) {
    params.push(status);
    clauses.push(`r.status = $${params.length}`);
  }
  if (reviewStatus) {
    params.push(reviewStatus);
    clauses.push(`r.review_status = $${params.length}`);
  }
  if (semaforo) {
    params.push(semaforo);
    clauses.push(`r.semaforo = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    clauses.push(`(r.ot ILIKE $${params.length} OR r.source_name ILIKE $${params.length})`);
  }

  return {
    sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

export async function GET(request) {
  try {
    await ensureReportSchema();
    const { searchParams } = new URL(request.url);
    const { limit, offset } = pageParams(searchParams);
    const where = whereClause(searchParams);

    const countRes = await query(
      `SELECT count(*)::int AS total FROM reports r ${where.sql}`,
      where.params
    );

    const rowsRes = await query(
      `SELECT
         r.id,
         r.ot,
         r.source_name,
         r.status,
         r.review_status,
         r.current_state,
         r.current_owner_type,
         r.current_owner_id,
         r.semaforo,
         r.confidence_score,
         r.template_filename,
         r.excel_url,
         r.drive_file_id,
         r.approved_at,
         r.rejected_at,
         r.error_message,
         r.created_at,
         r.updated_at,
         count(f.id)::int AS file_count,
         count(f.id) FILTER (WHERE f.kind = 'original_report')::int AS original_count,
         count(f.id) FILTER (WHERE f.kind = 'detail_photo')::int AS photo_count,
         count(f.id) FILTER (WHERE f.kind = 'generated_xls')::int AS xls_count
       FROM reports r
       LEFT JOIN report_files f ON f.report_id = r.id
       ${where.sql}
       GROUP BY r.id
       ORDER BY r.created_at DESC
       LIMIT $${where.params.length + 1}
       OFFSET $${where.params.length + 2}`,
      [...where.params, limit, offset]
    );

    const total = countRes.rows[0]?.total || 0;

    return NextResponse.json({
      ok: true,
      reports: rowsRes.rows,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + rowsRes.rows.length < total,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Error cargando reportes.' },
      { status: 500 }
    );
  }
}