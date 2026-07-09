import { generateAndAudit, maybeRecover } from './audit_flow.js';
import { publishFinalXls } from './publish.js';
import { runReportExtraction } from './run_extraction.js';
import { uploadInputFiles } from '../report_file_uploads.js';
import { createReport } from '../report_store.js';
import { markAudited, markExtracted, markReportError } from '../report_updates.js';
import { transitionReportWorkflow, WORKFLOW } from '../report_workflow.js';

function hasExplicitRetakeSignal(extraction) {
  const text = [extraction.mensaje, ...(extraction.razones || [])]
    .join(' ')
    .toLowerCase();
  return text.includes('toma nuevamente') || text.includes('no se pudo leer el checklist');
}

function lacksMinimumExtraction(extraction) {
  return !extraction.ot || !extraction.template_filename;
}

function needsRetake(extraction) {
  return hasExplicitRetakeSignal(extraction) || lacksMinimumExtraction(extraction);
}

function hasGeneratedXls(xls) {
  return Boolean(xls?.filename || xls?.excel_url || xls?.drive_file_id);
}

function isReview(audit) {
  return String(audit?.decision || '').toLowerCase() === 'review';
}

function technicianColor({ extraction, xls, audit }) {
  if (!hasGeneratedXls(xls) && needsRetake(extraction)) return 'red';
  return isReview(audit) ? 'yellow' : 'green';
}

function responseMessage({ extraction, xls, audit }) {
  if (!hasGeneratedXls(xls) && needsRetake(extraction)) {
    return 'La foto no se pudo leer bien. Toma nuevamente la imagen.';
  }
  if (isReview(audit)) return 'Informe recibido. Quedó pendiente de revisión administrativa.';
  return `Informe procesado. Excel generado: ${xls.filename}`;
}

function responseBody({ reportId, extraction, xls, audit, recovery }) {
  const retake = !hasGeneratedXls(xls) && needsRetake(extraction);
  return {
    ok: true,
    report_id: reportId,
    color: technicianColor({ extraction, xls, audit }),
    needs_retake: retake,
    message: responseMessage({ extraction, xls, audit }),
    ot: extraction.ot,
    semaforo: extraction.semaforo,
    confidence_score: extraction.confidence_score,
    template_filename: extraction.template_filename,
    excel_url: xls.excel_url,
    drive_file_id: xls.drive_file_id,
    audit,
    recovery,
  };
}

async function processAfterCreate(input, reportRow) {
  await uploadInputFiles({
    reportId: reportRow.id,
    reportFile: input.reportFile,
    reportBuffer: input.reportBuffer,
    photoPayload: input.photoPayload,
  });

  let extraction = await runReportExtraction({
    image: input.reportImage,
    otHint: input.otHint,
    sourceName: input.sourceName,
    reportId: reportRow.id,
  });
  await markExtracted(reportRow.id, extraction);

  let { xls, audit } = await generateAndAudit({
    reportImage: input.reportImage,
    extraction,
    photoPayload: input.photoPayload,
  });
  let recovery = null;

  const recovered = await maybeRecover({
    reportId: reportRow.id,
    reportImage: input.reportImage,
    extraction,
    photoPayload: input.photoPayload,
    audit,
  });
  if (recovered) ({ xls, audit, extraction, recovery } = recovered);

  await markAudited(reportRow.id, audit);
  xls = await publishFinalXls({ reportId: reportRow.id, extraction, xls });
  await transitionReportWorkflow(reportRow.id, WORKFLOW.PROCESSING_COMPLETED, {
    semaforo: extraction.semaforo,
  });
  return responseBody({ reportId: reportRow.id, extraction, xls, audit, recovery });
}

export async function runProcessReport(input) {
  const reportRow = await createReport({
    ot: input.otHint,
    sourceName: input.sourceName,
    tenantId: input.tenantId || null,
  });
  try {
    return { reportRow, body: await processAfterCreate(input, reportRow) };
  } catch (err) {
    await markReportError(reportRow.id, err).catch(console.error);
    throw err;
  }
}
