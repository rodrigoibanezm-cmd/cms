import { NextResponse } from 'next/server';
import { downloadDriveFile } from '../../../../../../lib/xls/google_drive.js';
import { getOrCreateFinalPdf } from '../../../../../../lib/report_pdf.js';

export const runtime = 'nodejs';

function safeName(name) {
  return String(name || 'informe.pdf').replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function pdfResponse(buffer, filename) {
  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', 'attachment; filename=' + safeName(filename));
  headers.set('Cache-Control', 'no-store');
  return new NextResponse(buffer, { headers });
}

export async function GET(request, { params }) {
  try {
    const routeParams = await params;
    const result = await getOrCreateFinalPdf(routeParams.id);
    const file = result.file;
    const buffer = await downloadDriveFile(file.drive_file_id);
    return pdfResponse(buffer, file.filename);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
