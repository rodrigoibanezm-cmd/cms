import AssignSecretaryForm from './AssignSecretaryForm.js';
import {
  clientLabel,
  confidenceInfo,
  dateLabel,
  pdfReady,
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
      <small>{clientLabel(report)}</small>
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

function SecretaryCell({ report, secretaries, token }) {
  return (
    <details className={styles.secretary}>
      <summary>{report.tenant_name || 'Sin asignar'}</summary>
      <AssignSecretaryForm
        report={report}
        secretaries={secretaries}
        action={withToken('/api/admin/reports/assign', token)}
        returnTo={withToken('/admin', token)}
      />
    </details>
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

export default function OperationTable({ reports, secretaries, token }) {
  return (
    <section className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>OT</th>
            <th>Ingreso</th>
            <th>Técnico</th>
            <th>Confianza IA</th>
            <th>Estado workflow</th>
            <th>Secretaria asignada</th>
            <th>Tiempo esperando</th>
            <th>PDF</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td><DetailCell report={report} token={token} /></td>
              <td>{dateLabel(report.created_at)}</td>
              <td>{report.technician_name || '-'}</td>
              <td><ConfidenceCell report={report} /></td>
              <td><WorkflowCell report={report} /></td>
              <td><SecretaryCell report={report} secretaries={secretaries} token={token} /></td>
              <td><WaitCell report={report} /></td>
              <td><PdfCell report={report} token={token} /></td>
              <td><a className={styles.arrow} href={withToken(`/admin/report?id=${report.id}`, token)}>Abrir</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
