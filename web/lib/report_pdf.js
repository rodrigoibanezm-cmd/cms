import { query } from './db.js';
import { addReportEvent, addReportFile, ensureReportSchema } from './report_store.js';
import { convertXlsDriveFileToPdf, PDF_VERSION } from './pdf_drive.js';

async function loadReport(reportId) {
  const res = await query(`SELECT * FROM reports WHERE id=$1`, [reportId]);
  return res.rows[0] || null;
}

async function latestFile(reportId, kind) {
  const res = await query(
    `SELECT * FROM report_files WHERE report_id=$1 AND kind=$2
     ORDER BY created_at DESC LIMIT 1`,
    [reportId, kind]
  );
  return res.rows[0] || null;
}

async function hasCurrentPdfEvent(reportId, fileId) {
  const res = await query(
    `SELECT 1 FROM report_events
     WHERE report_id=$1 AND event='final_document_generated'
       AND payload_json->>'drive_file_id'=$2
       AND payload_json->>'pdf_version'=$3
     LIMIT 1`,
    [reportId, fileId, PDF_VERSION]
  );
  return Boolean(res.rows[0]);
}

function assertCanGenerate(report) {
  if (!report) throw new Error('OT no encontrada');
  if (!report.secretary_approved_at) throw new Error('OT sin aprobación de secretaria');
}

function fileResponse(file, created) {
  return {
    created,
    file: { filename: file.filename, drive_file_id: file.drive_file_id, url: file.url },
  };
}

async function currentPdf(reportId) {
  const existing = await latestFile(reportId, 'generated_pdf');
  if (!existing) return null;
  return await hasCurrentPdfEvent(reportId, existing.drive_file_id) ? existing : null;
}

export async function getOrCreateFinalPdf(reportId) {
  if (!reportId) throw new Error('reportId requerido');
  await ensureReportSchema();

  const existing = await currentPdf(reportId);
  if (existing) return fileResponse(existing, false);

  const report = await loadReport(reportId);
  assertCanGenerate(report);
  const xlsFile = await latestFile(reportId, 'generated_xls');
  if (!xlsFile) throw new Error('XLS generado no encontrado');

  const pdf = await convertXlsDriveFileToPdf({ report, xlsFile });
  await addReportFile(reportId, { kind: 'generated_pdf', ...pdf });
  await addReportEvent(reportId, 'final_document_generated', {
    filename: pdf.filename,
    drive_file_id: pdf.driveFileId,
    pdf_version: PDF_VERSION,
  });

  return fileResponse({ filename: pdf.filename, drive_file_id: pdf.driveFileId, url: pdf.url }, true);
}
