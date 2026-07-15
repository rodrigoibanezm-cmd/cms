import { isEsmeril, transcriptionApproved } from '../../lib/final_proposal/service.js';
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
  if (!isEsmeril(report) || !transcriptionApproved(report)) return null;
  const proposal = report.final_report_proposal;
  const returnTo = token ? `/admin/report?id=${report.id}&token=${encodeURIComponent(token)}` : `/admin/report?id=${report.id}`;
  return (
    <section className={styles.panel}>
      <h2>Propuesta de informe técnico</h2>
      {!proposal ? <form action={action(report, token)} method="post"><input type="hidden" name="intent" value="generate" /><input type="hidden" name="return_to" value={returnTo} /><button>Generar propuesta</button></form> : null}
      {proposal ? <form className={styles.editor} action={action(report, token)} method="post"><input type="hidden" name="intent" value="save" /><input type="hidden" name="return_to" value={returnTo} />{FIELDS.map(([name, label]) => <label key={name}>{label}<textarea name={name} rows="4" defaultValue={proposal[name] || ''} /></label>)}<button>Guardar cambios</button></form> : null}
      {proposal ? <form action={action(report, token)} method="post"><input type="hidden" name="intent" value="regenerate" /><input type="hidden" name="return_to" value={returnTo} /><button className={styles.secondary}>Regenerar propuesta</button></form> : null}
    </section>
  );
}
