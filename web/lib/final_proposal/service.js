import { query } from '../db.js';
import { addReportEvent } from '../report_store.js';
import { getReport } from '../report_reads.js';
import { approvedXlsText } from './approved_xls.js';
import { cleanProposal, generateProposal } from './generator.js';

export function isEsmeril(report) {
  return [report?.template_key, report?.template_filename]
    .some((value) => String(value || '').toUpperCase().includes('ESMERIL'));
}

export function transcriptionApproved(report) {
  return Boolean(report?.transcription_approved_at || report?.secretary_approved_at || report?.approved_at);
}

async function proposalContext(reportId, access) {
  const data = await getReport(reportId, access);
  if (!data.report) throw new Error('OT no encontrada');
  if (!transcriptionApproved(data.report)) throw new Error('Transcripción no aprobada');
  if (!isEsmeril(data.report)) throw new Error('Propuesta disponible solo para ESMERIL');
  return data;
}

export async function generateProposalWithAccess({ reportId, access, force = false }) {
  const data = await proposalContext(reportId, access);
  if (data.report.final_report_proposal && !force) return { proposal: data.report.final_report_proposal, created: false };
  const xls = data.files.filter((file) => file.kind === 'generated_xls').at(-1);
  const proposal = await generateProposal(await approvedXlsText(xls));
  await query(`UPDATE reports SET final_report_proposal=$2,
    final_report_proposal_generated_at=now(), final_report_proposal_updated_at=now(), updated_at=now()
    WHERE id=$1`, [reportId, JSON.stringify(proposal)]);
  await addReportEvent(reportId, 'final_report_proposal_generated', {
    source_file_id: xls.id, source_drive_file_id: xls.drive_file_id, regenerated: force,
  }, data.report.tenant_id);
  return { proposal, created: true };
}

export async function saveProposalWithAccess({ reportId, access, proposal }) {
  const data = await proposalContext(reportId, access);
  const clean = cleanProposal(proposal);
  await query(`UPDATE reports SET final_report_proposal=$2,
    final_report_proposal_updated_at=now(), updated_at=now() WHERE id=$1`, [reportId, JSON.stringify(clean)]);
  await addReportEvent(reportId, 'final_report_proposal_updated', {}, data.report.tenant_id);
  return { proposal: clean };
}
