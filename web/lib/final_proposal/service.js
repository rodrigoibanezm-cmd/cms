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
  const xls = data.files.filter((file) => file.kind === 'generated_xls').at(-1);
  if (!xls) throw new Error('XLS aprobado no encontrado');
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
  if (data.report.final_report_proposal && !force) {
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
