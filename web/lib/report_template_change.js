import { query } from './db.js';
import { addReportEvent, addReportFile, ensureReportSchema } from './report_store.js';
import { downloadDriveFile } from './xls/google_drive.js';
import { generateFinalXls } from './xls_generator.js';
import { uploadTemplateFile } from './template_catalog.js';

const PHOTO_KIND = 'detail_photo';
const XLS_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function roleOf(access) {
  return String(access?.role || '').trim().toLowerCase();
}

function isAdmin(access) {
  return ['admin', 'super_admin'].includes(roleOf(access));
}

function ownerSql(access) {
  return isAdmin(access) ? '' : 'AND current_owner_id=$3';
}

function params(id, access) {
  const values = [id, access.tenantId];
  if (!isAdmin(access)) values.push(access.userId);
  return values;
}

async function loadReport(id, access) {
  const res = await query(
    `SELECT * FROM reports WHERE id::text=$1 AND tenant_id=$2 ${ownerSql(access)}`,
    params(id, access)
  );
  return res.rows[0] || null;
}

async function loadPhotos(reportId, tenantId) {
  const res = await query(
    `SELECT filename, mime_type, drive_file_id FROM report_files
     WHERE report_id=$1 AND tenant_id=$2 AND kind=$3 ORDER BY created_at`,
    [reportId, tenantId, PHOTO_KIND]
  );
  return Promise.all(res.rows.map(async (file) => ({
    filename: file.filename,
    mimeType: file.mime_type,
    buffer: await downloadDriveFile(file.drive_file_id),
  })));
}

async function registerXls(report, xls) {
  await query(
    `UPDATE reports SET template_key=$2, template_filename=$3, excel_url=$4,
      drive_file_id=$5, status='processed', updated_at=now() WHERE id=$1`,
    [report.id, report.extraction_json?.template_key || null,
      report.extraction_json?.template_filename || null, xls.excel_url, xls.drive_file_id]
  );
  await addReportFile(report.id, {
    kind: 'generated_xls', filename: xls.filename, mimeType: XLS_MIME,
    driveFileId: xls.drive_file_id, url: xls.excel_url,
  }, report.tenant_id);
}

async function invalidatePdf(reportId, tenantId) {
  await query(
    `DELETE FROM report_files WHERE report_id=$1 AND tenant_id=$2 AND kind='generated_pdf'`,
    [reportId, tenantId]
  );
}

function selectedTemplate(form) {
  return String(form.get('template_filename') || '').trim();
}

export async function changeReportTemplate({ reportId, access, form }) {
  await ensureReportSchema();
  const uploaded = await uploadTemplateFile(form.get('template_file'));
  const template = uploaded?.filename || selectedTemplate(form);
  if (!template) throw new Error('Debe seleccionar o subir una plantilla');

  const report = await loadReport(reportId, access);
  if (!report) throw new Error('OT no encontrada');
  if (!report.extraction_json) throw new Error('OT sin extracción');

  const extraction = { ...report.extraction_json, template_filename: template };
  const photos = await loadPhotos(report.id, report.tenant_id);
  const xls = await generateFinalXls({ extraction, photos, publish: true });
  const updated = { ...report, extraction_json: extraction };
  await registerXls(updated, xls);
  await invalidatePdf(report.id, report.tenant_id);
  await addReportEvent(report.id, 'template_changed', {
    template_filename: template,
    uploaded_template: Boolean(uploaded),
    generated_xls: xls.filename,
  }, report.tenant_id);
  return { template, xls };
}