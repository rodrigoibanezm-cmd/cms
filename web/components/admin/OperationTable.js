import AssignSecretaryForm from './AssignSecretaryForm.js';
import {
  confidenceInfo,
  dateLabel,
  pdfReady,
  toolLabel,
  waitInfo,
  workflowInfo,
} from './operation_helpers.js';
import styles from '../../app/admin/operationTable.module.css';

function ToneText({ info }) {
  return <span className={`${styles.tone} ${styles[info.tone]}`}>{info.label}</span>;
}

function withToken(path, token) {
  return token ? `${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : path;
}

function DetailCell({ report, token }) {
  return (
    <a className={styles.otLink} href={withToken(`/admin/report?id=${report.id}`, token)}>
      <strong>{report.ot || '-'}</strong>
      <small>{toolLabel(report)}</small>
    </a>
  );
}

function ConfidenceCell({ report }) {
  const info = confidenceInfo(report.confidence_score);
  return <div><ToneText info={info} /><small>{info.detail}</small></div>;
}

function WorkflowCell({ report }) {
  const info = workflowInfo(report.current_state);
  return <span className={`${styles.pill} ${styles[info.tone]}`}>{info.label}</span>;
}

function SecretaryStatus({ report }) {
  return <div className={styles.assignmentStatus}><strong>{report.tenant_name || 'Sin asignar'}</strong><small>{report.current_owner_id ? 'Asignada' : 'Pendiente de asignación'}</small></div>;
}

function SecretaryCell({ report, secretaries, token, canAssign, returnTo }) {
  if (!canAssign) return <span>{report.tenant_name || '-'}</span>;
  return (
    <div className={styles.assignmentCell}>
      <SecretaryStatus report={report} />
      <AssignSecretaryForm report={report} secretaries={secretaries} compact action={withToken('/api/admin/reports/assign', token)} returnTo={withToken(returnTo, token)} />
    </div>
  );
}

function WaitCell({ report }) {
  const info = waitInfo(report);
  return <div><ToneText info={info} /><small>{info.detail}</small></div>;
}

function PdfCell({ report, token }) {
  if (!pdfReady(report)) return <span className={styles.emptyPdf}>-</span>;
  return <a className={styles.pdf} href={withToken(`/api/admin/reports/${report.id}/pdf`, token)}>PDF</a>;
}

export default function OperationTable({ reports, secretaries, token, canAssign = true, showPdf = true, showSecretary = true, returnTo = '/admin' }) {
  return (
    <section className={styles.wrap}>
      <table className={styles.table}>
        <thead><tr><th>OT</th><th>Ingreso</th><th>Técnico</th><th>Calidad XLS</th><th>Estado workflow</th>{showSecretary ? <th>Administrativa asignada</th> : null}<th>Tiempo esperando</th>{showPdf ? <th>PDF</th> : null}<th></th></tr></thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td><DetailCell report={report} token={token} /></td>
              <td>{dateLabel(report.created_at)}</td>
              <td>{report.technician_name || '-'}</td>
              <td><ConfidenceCell report={report} /></td>
              <td><WorkflowCell report={report} /></td>
              {showSecretary ? <td><SecretaryCell report={report} secretaries={secretaries} token={token} canAssign={canAssign} returnTo={returnTo} /></td> : null}
              <td><WaitCell report={report} /></td>
              {showPdf ? <td><PdfCell report={report} token={token} /></td> : null}
              <td><a className={styles.arrow} href={withToken(`/admin/report?id=${report.id}`, token)}>Abrir</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
