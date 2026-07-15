import { addReportEvent, addReportFile } from './report_store.js';
import { getReport } from './report_reads.js';
import { downloadDriveFile } from './xls/google_drive.js';
import { generateEsmerilFinal } from './final_report/generator.js';

const XLS_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function isEsmeril(report) {
  const data = report?.extraction_json || {};
  return [report?.template_key, report?.template_filename, data.template_key, data.tipo_herramienta]
    .some((value) => String(value || '').toUpperCase().includes('ESMERIL'));
}

export function hasTranscriptionApproval(report) {
  return Boolean(report?.transcription_approved_at || report?.secretary_approved_at || report?.approved_at);
}

async function photoPayload(files) {
  const photos = files.filter((file) => file.kind === 'detail_photo' && file.drive_file_id);
  return Promise.all(photos.map(async (file) => ({
    filename: file.filename,
    mimeType: file.mime_type,
    buffer: await downloadDriveFile(file.drive_file_id),
  })));
}

export async function generateFinalReportWithAccess({ reportId, access }) {
  const data = await getReport(reportId, access);
  if (!data.report) throw new Error('OT no encontrada');
  if (!hasTranscriptionApproval(data.report)) throw new Error('Transcripción no aprobada');
  if (!isEsmeril(data.report)) throw new Error('Informe final disponible solo para ESMERIL');
  const existing = data.files.find((file) => file.kind === 'generated_final_xls');
  if (existing) return { file: existing, created: false };
  const generated = await generateEsmerilFinal({
    extraction: data.report.extraction_json || {},
    photos: await photoPayload(data.files),
  });
  await addReportFile(reportId, { kind: 'generated_final_xls', filename: generated.filename,
    mimeType: XLS_MIME, driveFileId: generated.drive_file_id, url: generated.excel_url }, data.report.tenant_id);
  await addReportEvent(reportId, 'final_report_generated', { filename: generated.filename,
    drive_file_id: generated.drive_file_id }, data.report.tenant_id);
  return { file: generated, created: true };
}
