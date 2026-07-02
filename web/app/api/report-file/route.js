import { NextResponse } from 'next/server';
import { query } from '../../../lib/db.js';
import { downloadDriveFile } from '../../../lib/xls/google_drive.js';

export const runtime = 'nodejs';

async function findReportFile(id) {
  const res = await query(
    `SELECT id, filename, mime_type, drive_file_id
     FROM report_files
     WHERE id=$1`,
    [id]
  );
  return res.rows[0] || null;
}

export async function GET(request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'Falta id.' }, { status: 400 });

  const file = await findReportFile(id);
  if (!file?.drive_file_id) {
    return NextResponse.json({ ok: false, error: 'Archivo no encontrado.' }, { status: 404 });
  }

  const buffer = await downloadDriveFile(file.drive_file_id);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': file.mime_type || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${file.filename || 'archivo'}"`,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
