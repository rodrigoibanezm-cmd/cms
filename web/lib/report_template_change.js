import { query } from './db.js';
import { addReportEvent, addReportFile, ensureReportSchema } from './report_store.js';
import { downloadDriveFile } from './xls/google_drive.js';
import { generateFinalXls } from './xls_generator.js';
import { uploadTemplateFile } from './template_catalog.js';

const PHOTO_KIND = 'detail_photo';
const XLS_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function isAdmin(access) {
  return ['admin', 'super_admin'].includes(String(access?.role || '').toLowerCase());
}

function tenantSql(access) {
  return isAdmin(access) ? '(tenant_id=$2 OR tenant_id IS NULL)' : 'tenant_id=$2';
}

function ownerSql(access) {
  return isAdmin(access) ? '' : 'AND current_owner_id=$3';
}

function accessParams(id, access) {
  const values = [id, access.tenantId];
  if (!isAdmin(access)) values.push(access.userId);
  return values;
}

async function loadReport(id, access) {
  const res = await query(
    `SELECT * FROM reports WHERE id::text=$1 AND ${tenantSql(access)} ${ownerSql(access)}`,
    accessParams(id, access)
  );
  return res.rows[0] || null;
}

async function loadPhotos(reportId) {
  const res = await query(
    `SELECT filename, mime_type, drive_file_id FROM report_files
     WHERE report_id=$1 AND kind=$2 ORDER BY created_at`,
    [reportId, PHOTO_KIND]
  );
  return Promise.all(res.rows.map(async (file) => ({
    filename: file.filename,
    mimeType: file.mime_type,
    buffer: await downloadDriveFile(file.drive_file_id),
  })));
}

function tenantUpdate(report) {
  const base = [report.id, report.extraction_json?.template_key || null,
    report.extraction_json?.template_filename || null,
    report.xls.excel_url, report.xls.drive_file_id, JSON.stringify(report.extraction_json)];
  if (!report.tenant_id) return { where: 'tenant_id IS NULL', params: base };
  return { where: 'tenant_id=$7', params: [...base, report.tenant_id] };
}

async function registerXls(report, xls) {
  const target = tenantUpdate({ ...report, xls });
  await query(
    `UPDATE reports SET template_key=$2, template_filename=$3, excel_url=$4,
      drive_file_id=$5, extraction_json=$6, status='processed', updated_at=now()
      WHERE id=$1 AND ${target.where}`,
    target.params
  );
  await addReportFile(report.id, {
    kind: 'generated_xls', filename: xls.filename, mimeType: XLS_MIME,
    driveFileId: xls.drive_file_id, url: xls.excel_url,
  }, report.tenant_id);
}

async function invalidatePdf(reportId, tenantId) {
  const where = tenantId ? 'tenant_id=$2' : 'tenant_id IS NULL';
  const params = tenantId ? [reportId, tenantId] : [reportId];
  await query(`DELETE FROM report_files WHERE report_id=$1 AND ${where} AND kind='generated_pdf'`, params);
}

function selectedTemplate(form) {
  return String(form.get('template_filename') || '').trim();
}

export async function changeReportTemplate({ reportId, access, form }) {
  await ensureReportSchema();
  const report = await loadReport(reportId, access);
  if (!report) throw new Error('OT no encontrada');
  if (!report.extraction_json) throw new Error('OT sin extracción');

  const uploaded = await uploadTemplateFile(form.get('template_file'));
  const template = uploaded?.filename || selectedTemplate(form);
  if (!template) throw new Error('Debe seleccionar o subir una plantilla');

  const extraction = { ...report.extraction_json, template_filename: template };
  const xls = await generateFinalXls({ extraction, photos: await loadPhotos(report.id), publish: true });
  await registerXls({ ...report, extraction_json: extraction }, xls);
  await invalidatePdf(report.id, report.tenant_id);
  await addReportEvent(report.id, 'template_changed', {
    template_filename: template, uploaded_template: Boolean(uploaded), generated_xls: xls.filename,
  }, report.tenant_id);
  return { template, xls };
}
