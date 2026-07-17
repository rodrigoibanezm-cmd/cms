import { query } from '../db.js';
import { addReportEvent } from '../report_store.js';
import { getReport } from '../report_reads.js';
import { approvedXlsText } from './approved_xls.js';
import { generateProposal } from './generator.js';

const SPEC_VERSION = 'cm_services_language_v1';

export function transcriptionApproved(report) {
  return Boolean(report?.transcription_approved_at || report?.secretary_approved_at || report?.approved_at);
}

async function proposalContext(reportId, access) {
  const data = await getReport(reportId, access);
  if (!data.report) throw new Error('OT no encontrada');
  if (!transcriptionApproved(data.report)) throw new Error('Transcripción no aprobada');
  const sourceId = data.report.transcription_approved_xls_file_id;
  if (!sourceId) throw new Error('La aprobación no identifica su XLS fuente');
  const xls = data.files.find((file) => file.id === sourceId && file.kind === 'generated_xls');
  if (!xls) throw new Error('El XLS aprobado registrado no está disponible');
  return { ...data, xls };
}

async function recordFailure(data, model, error, regenerated) {
  await addReportEvent(data.report.id, 'final_report_proposal_failed', {
    source_file_id: data.xls.id, model, specification: SPEC_VERSION,
    regenerated, error: error.message,
  }, data.report.tenant_id);
}

export async function generateProposalWithAccess({ reportId, access, force = false }) {
  const data = await proposalContext(reportId, access);
  const sameSource = data.report.final_report_proposal_source_file_id === data.xls.id;
  if (data.report.final_report_proposal && sameSource && !force) {
    return { proposal: data.report.final_report_proposal, created: false };
  }
  let generated;
  try {
    generated = await generateProposal(await approvedXlsText(data.xls));
  } catch (error) {
    const model = process.env.GEMINI_FINAL_PROPOSAL_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    await recordFailure(data, model, error, force);
    throw error;
  }
  await query(`UPDATE reports SET final_report_proposal=$2,
    final_report_proposal_generated_at=now(), final_report_proposal_model=$3,
    final_report_proposal_spec_version=$4, final_report_proposal_source_file_id=$5,
    updated_at=now() WHERE id=$1`, [
    reportId, JSON.stringify(generated.proposal), generated.model, SPEC_VERSION, data.xls.id,
  ]);
  await addReportEvent(reportId, 'final_report_proposal_generated', {
    source_file_id: data.xls.id, source_drive_file_id: data.xls.drive_file_id,
    model: generated.model, specification: SPEC_VERSION, regenerated: force,
  }, data.report.tenant_id);
  return { proposal: generated.proposal, created: true };
}
