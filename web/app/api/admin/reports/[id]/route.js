import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import { ensureReportSchema } from '../../../../lib/report_store.js';

export const runtime = 'nodejs';

function latestAudit(events) {
  return events.find((event) => event.event === 'audit_completed')?.payload_json || null;
}

function filesByKind(files) {
  return files.reduce((acc, file) => {
    if (!acc[file.kind]) acc[file.kind] = [];
    acc[file.kind].push(file);
    return acc;
  }, {});
}

export async function GET(_request, { params }) {
  try {
    await ensureReportSchema();
    const { id } = await params;

    const reportRes = await query('SELECT * FROM reports WHERE id=$1', [id]);
    if (!reportRes.rows.length) {
      return NextResponse.json({ ok: false, error: 'Reporte no encontrado.' }, { status: 404 });
    }

    const filesRes = await query(
      `SELECT * FROM report_files WHERE report_id=$1 ORDER BY created_at ASC`,
      [id]
    );
    const eventsRes = await query(
      `SELECT event, payload_json, created_at
       FROM report_events WHERE report_id=$1 ORDER BY created_at DESC`,
      [id]
    );

    const files = filesRes.rows;
    const events = eventsRes.rows;

    return NextResponse.json({
      ok: true,
      report: reportRes.rows[0],
      files,
      files_by_kind: filesByKind(files),
      audit: latestAudit(events),
      events,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Error cargando revisión.' },
      { status: 500 }
    );
  }
}
