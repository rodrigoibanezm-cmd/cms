import { query } from './db.js';
import { addReportEvent } from './report_store.js';
import { transitionReportWorkflow, WORKFLOW } from './report_workflow.js';

const table = 'reports';

export async function markExtracted(id, extraction) {
  const sql = `UPDATE ${table} SET ot=$2, semaforo=$3, confidence_score=$4,
    template_key=$5, template_filename=$6, extraction_json=$7,
    updated_at=now() WHERE id=$1`;
  await query(sql, [id, extraction.ot || null, extraction.semaforo || null,
    extraction.confidence_score ?? null, extraction.template_key || null,
    extraction.template_filename || null, JSON.stringify(extraction)]);
  await addReportEvent(id, 'extracted', { semaforo: extraction.semaforo });
}

export async function markXlsGenerated(id, xls) {
  const sql = `UPDATE ${table} SET status='processed', excel_url=$2,
    drive_file_id=$3, error_message=NULL, updated_at=now() WHERE id=$1`;
  await query(sql, [id, xls.excel_url || null, xls.drive_file_id || null]);
  await addReportEvent(id, 'xls_generated', { filename: xls.filename });
}

export async function markAudited(id, audit) {
  const status = audit?.decision === 'approve' ? 'approved'
    : audit?.decision === 'recover' ? 'recover'
      : 'review';
  const sql = `UPDATE ${table} SET review_status=$2, updated_at=now() WHERE id=$1`;
  await query(sql, [id, status]);
  await addReportEvent(id, 'audit_completed', audit || {});
}

export async function markReportError(id, err) {
  const message = err?.message || String(err);
  const sql = `UPDATE ${table} SET status='error', error_message=$2,
    updated_at=now() WHERE id=$1`;
  await query(sql, [id, message]);
  await transitionReportWorkflow(id, WORKFLOW.PROCESSING_FAILED, { message });
  await addReportEvent(id, 'error', { message });
}

export async function setReviewStatus(id, status) {
  const sql = `UPDATE ${table} SET review_status=$2, updated_at=now() WHERE id=$1`;
  await query(sql, [id, status]);
  await addReportEvent(id, status, {});
}