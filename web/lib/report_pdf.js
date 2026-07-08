import { query } from './db.js';
import { addReportEvent, addReportFile, ensureReportSchema } from './report_store.js';
import { convertXlsDriveFileToPdf, PDF_VERSION } from './pdf_drive.js';

function isAdmin(access) {
  return ['admin', 'super_admin'].includes(access.role);
}

function reportWhere(access) {
  if (isAdmin(access)) return 'id=$1';
  return 'id=$1 AND tenant_id=$2 AND current_owner_id=$3';
}

function reportParams(reportId, access) {
  if (isAdmin(access)) return [reportId];
  return [reportId, access.tenantId, access.userId];
}

async function loadReport(reportId, access) {
  const res = await query(
    `SELECT * FROM reports WHERE ${reportWhere(access)}`,
    reportParams(reportId, access)
  );
  return res.rows[0] || null;
}

function fileWhere(access) {
  if (isAdmin(access)) return 'report_id=$1 AND kind=$2';
  return 'report_id=$1 AND tenant_id=$2 AND kind=$3';
}

function fileParams(reportId, access, kind) {
  if (isAdmin(access)) return [reportId, kind];
  return [reportId, access.tenantId, kind];
}

async function latestFile(reportId, access, kind) {
  const res = await query(
    `SELECT * FROM report_files
     WHERE ${fileWhere(access)}
     ORDER BY created_at DESC LIMIT 1`,
    fileParams(reportId, access, kind)
  );
  return res.rows[0] || null;
}

async function hasCurrentPdfEvent(reportId, fileId) {
  const res = await query(
    `SELECT 1 FROM report_events
     WHERE report_id=$1 AND event='final_document_generated'
       AND payload_json->>'drive_file_id'=$2 AND payload_json->>'pdf_version'=$3
     LIMIT 1`,
    [reportId, fileId, PDF_VERSION]
  );
  return Boolean(res.rows[0]);
}

function assertAccess(access) {
  if (!isAdmin(access) && !access?.tenantId) throw new Error('tenantId requerido');
  if (!access?.userId) throw new Error('userId requerido');
}

function assertCanGenerate(report) {
  if (!report) throw new Error('OT no encontrada');
  if (!report.secretary_approved_at) throw new Error('OT sin aprobación');
}

function fileResponse(file, created) {
  return { created, file: { filename: file.filename, drive_file_id: file.drive_file_id, url: file.url } };
}

async function currentPdf(reportId, access) {
  const existing = await latestFile(reportId, access, 'generated_pdf');
  if (!existing) return null;
  return await hasCurrentPdfEvent(reportId, existing.drive_file_id) ? existing : null;
}

export async function getOrCreateFinalPdf(reportId, access) {
  if (!reportId) throw new Error('reportId requerido');
  assertAccess(access);
  await ensureReportSchema();

  const report = await loadReport(reportId, access);
  assertCanGenerate(report);
  const existing = await currentPdf(reportId, access);
  if (existing) return fileResponse(existing, false);

  const xlsFile = await latestFile(reportId, access, 'generated_xls');
  if (!xlsFile) throw new Error('XLS generado no encontrado');

  const pdf = await convertXlsDriveFileToPdf({ report, xlsFile });
  await addReportFile(reportId, { kind: 'generated_pdf', ...pdf }, report.tenant_id);
  await addReportEvent(reportId, 'final_document_generated', {
    filename: pdf.filename,
    drive_file_id: pdf.driveFileId,
    pdf_version: PDF_VERSION,
  }, report.tenant_id);

  return fileResponse({ filename: pdf.filename, drive_file_id: pdf.driveFileId, url: pdf.url }, true);
}
