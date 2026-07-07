import AssignSecretaryForm from './AssignSecretaryForm.js';
import {
  clientLabel,
  confidenceInfo,
  pdfReady,
  waitInfo,
  workflowInfo,
} from './operation_helpers.js';
import styles from '../../app/admin/operationTable.module.css';

function ToneText({ info }) {
  return <span className={`${styles.tone} ${styles[info.tone]}`}>{info.label}</span>;
}

function DetailCell({ report }) {
  return (
    <a className={styles.otLink} href={`/admin/report?id=${report.id}`}>
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

function SecretaryCell({ report, secretaries }) {
  return (
    <details className={styles.secretary}>
      <summary>{report.tenant_name || 'Sin asignar'}</summary>
      <AssignSecretaryForm report={report} secretaries={secretaries} returnTo="/admin" />
    </details>
  );
}

function WaitCell({ report }) {
  const info = waitInfo(report);
  return <div><ToneText info={info} /><small>{info.detail}</small></div>;
}

function PdfCell({ report }) {
  if (!pdfReady(report)) return <span className={styles.emptyPdf}>-</span>;
  return <a className={styles.pdf} href={`/api/admin/reports/${report.id}/pdf`}>PDF</a>;
}

export default function OperationTable({ reports, secretaries }) {
  return (
    <section className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>OT</th>
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
              <td><DetailCell report={report} /></td>
              <td>{report.technician_name || '-'}</td>
              <td><ConfidenceCell report={report} /></td>
              <td><WorkflowCell report={report} /></td>
              <td><SecretaryCell report={report} secretaries={secretaries} /></td>
              <td><WaitCell report={report} /></td>
              <td><PdfCell report={report} /></td>
              <td><a className={styles.arrow} href={`/admin/report?id=${report.id}`}>Abrir</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}