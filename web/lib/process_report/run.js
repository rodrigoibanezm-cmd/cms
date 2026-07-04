import { generateAndAudit, maybeRecover } from './audit_flow.js';
import { publishFinalXls } from './publish.js';
import { runReportExtraction } from './run_extraction.js';
import { uploadInputFiles } from '../report_file_uploads.js';
import { createReport } from '../report_store.js';
import { markAudited, markExtracted, markReportError } from '../report_updates.js';
import { transitionReportWorkflow, WORKFLOW } from '../report_workflow.js';

function colorFrom(semaforo) {
  if (semaforo === 'VERDE') return 'green';
  if (semaforo === 'ROJO') return 'red';
  return 'yellow';
}

function responseBody({ reportId, extraction, xls, audit, recovery }) {
  return {
    ok: true,
    report_id: reportId,
    color: colorFrom(extraction.semaforo),
    message: `Informe procesado. Excel generado: ${xls.filename}`,
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
  const reportRow = await createReport({ ot: input.otHint, sourceName: input.sourceName });
  try {
    return { reportRow, body: await processAfterCreate(input, reportRow) };
  } catch (err) {
    await markReportError(reportRow.id, err).catch(console.error);
    throw err;
  }
}