import { query } from './db.js';
import { addReportEvent, addReportFile, ensureReportSchema } from './report_store.js';
import { convertXlsDriveFileToPdf, PDF_VERSION } from './pdf_drive.js';

function roleOf(access) {
  return String(access?.role || '').trim().toLowerCase();
}

function isAdmin(access) {
  return ['admin', 'super_admin'].includes(roleOf(access));
}

function reportWhere(access) {
  const idMatch = '(id::text=$1 OR ot::text=$1) AND tenant_id=$2';
  if (isAdmin(access)) return idMatch;
  return `${idMatch} AND current_owner_id=$3`;
}

function reportParams(key, access) {
  if (isAdmin(access)) return [key, access.tenantId];
  return [key, access.tenantId, access.userId];
}

async function loadReport(key, access) {
  const res = await query(
    `SELECT * FROM reports WHERE ${reportWhere(access)} ORDER BY created_at DESC LIMIT 1`,
    reportParams(key, access)
  );
  return res.rows[0] || null;
}

async function latestFile(reportId, tenantId, kind) {
  const res = await query(
    `SELECT * FROM report_files WHERE report_id=$1 AND tenant_id=$2 AND kind=$3
     ORDER BY created_at DESC LIMIT 1`,
    [reportId, tenantId, kind]
  );
  return res.rows[0] || null;
}

async function hasCurrentPdfEvent(reportId, tenantId, fileId) {
  const res = await query(
    `SELECT 1 FROM report_events
     WHERE report_id=$1 AND tenant_id=$2 AND event='final_document_generated'
       AND payload_json->>'drive_file_id'=$3 AND payload_json->>'pdf_version'=$4
     LIMIT 1`,
    [reportId, tenantId, fileId, PDF_VERSION]
  );
  return Boolean(res.rows[0]);
}

function assertAccess(access) {
  if (!access?.tenantId) throw new Error('tenantId requerido');
  if (!access?.userId) throw new Error('userId requerido');
}

function assertCanGenerate(report) {
  if (!report) throw new Error('OT no encontrada');
  if (!report.secretary_approved_at) throw new Error('OT sin aprobación');
}

function fileResponse(file, created) {
  return { created, file: { filename: file.filename, drive_file_id: file.drive_file_id, url: file.url } };
}

async function currentPdf(reportId, tenantId) {
  const existing = await latestFile(reportId, tenantId, 'generated_pdf');
  if (!existing) return null;
  return await hasCurrentPdfEvent(reportId, tenantId, existing.drive_file_id) ? existing : null;
}

export async function getOrCreateFinalPdf(reportKey, access) {
  if (!reportKey) throw new Error('reportId requerido');
  assertAccess(access);
  await ensureReportSchema();

  const report = await loadReport(reportKey, access);
  assertCanGenerate(report);
  const existing = await currentPdf(report.id, report.tenant_id);
  if (existing) return fileResponse(existing, false);

  const xlsFile = await latestFile(report.id, report.tenant_id, 'generated_xls');
  if (!xlsFile) throw new Error('XLS generado no encontrado');

  const pdf = await convertXlsDriveFileToPdf({ report, xlsFile });
  await addReportFile(report.id, { kind: 'generated_pdf', ...pdf }, report.tenant_id);
  await addReportEvent(report.id, 'final_document_generated', {
    filename: pdf.filename,
    drive_file_id: pdf.driveFileId,
    pdf_version: PDF_VERSION,
  }, report.tenant_id);

  return fileResponse({ filename: pdf.filename, drive_file_id: pdf.driveFileId, url: pdf.url }, true);
}