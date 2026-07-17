import { transcriptionApproved } from '../../lib/final_proposal/service.js';
import styles from '../../app/admin/report/proposal.module.css';

const FIELDS = [
  ['inspeccion_visual', 'Inspección visual'],
  ['prueba_funcionamiento', 'Prueba de funcionamiento'],
  ['desarme', 'Desarme'],
  ['reparacion', 'Reparación'],
  ['recomendaciones', 'Recomendaciones'],
];

function action(report, token) {
  const base = `/api/secretary/reports/${report.id}/proposal`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

export default function TechnicalProposalForm({ report, token }) {
  if (!transcriptionApproved(report)) return null;
  if (!report.transcription_approved_xls_file_id) return (
    <section className={styles.panel}>
      <h2>Propuesta técnica generada</h2>
      <p>Esta aprobación antigua no identifica el XLS fuente. Vuelva a aprobar la transcripción vigente.</p>
    </section>
  );
  const proposal = report.final_report_proposal;
  const returnTo = token
    ? `/admin/report?id=${report.id}&token=${encodeURIComponent(token)}`
    : `/admin/report?id=${report.id}`;
  return (
    <section className={styles.panel}>
      <h2>Propuesta técnica generada</h2>
      {proposal ? <div className={styles.blocks}>{FIELDS.map(([name, label]) => (
        <div key={name}><h3>{label}</h3><p>{proposal[name] || 'Sin evidencia suficiente.'}</p></div>
      ))}</div> : <p>Esta OT todavía no tiene una propuesta técnica.</p>}
      <form action={action(report, token)} method="post">
        <input type="hidden" name="intent" value={proposal ? 'regenerate' : 'generate'} />
        <input type="hidden" name="return_to" value={returnTo} />
        <button>{proposal ? 'Regenerar propuesta' : 'Generar propuesta técnica'}</button>
      </form>
    </section>
  );
}
