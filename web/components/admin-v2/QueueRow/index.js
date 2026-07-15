import AssignSecretaryForm from '../../admin/AssignSecretaryForm.js';
import {
  confidenceInfo,
  dateLabel,
  pdfReady,
  toolLabel,
  waitInfo,
  workflowInfo,
} from '../../admin/operation_helpers.js';
import { withToken } from '../admin_v2_url_helpers.js';
import styles from '../../../app/admin-v2/queue.module.css';

function Tone({ info }) {
  return <span className={`${styles.tone} ${styles[info.tone]}`}>{info.label}</span>;
}

function Assignment({ canAssign, report, secretaries, token }) {
  if (!canAssign) return <strong>{report.tenant_name || 'Sin asignar'}</strong>;
  return (
    <div className={styles.assignment}>
      <strong>{report.tenant_name || 'Sin asignar'}</strong>
      <AssignSecretaryForm
        action={withToken('/api/admin/reports/assign', token)}
        compact
        report={report}
        returnTo={withToken('/admin-v2', token)}
        secretaries={secretaries}
      />
    </div>
  );
}

export default function QueueRow({
  canAssign,
  report,
  secretaries,
  showPdf,
  token,
}) {
  const returnTo = encodeURIComponent('/admin-v2');
  const detail = withToken(`/admin/report?id=${report.id}&returnTo=${returnTo}`, token);
  const quality = confidenceInfo(report.confidence_score);
  const workflow = workflowInfo(report.current_state);
  const wait = waitInfo(report);
  return (
    <tr>
      <td><a className={styles.primary} href={detail}><strong>{report.ot || '-'}</strong><small>{toolLabel(report)}</small></a></td>
      <td><a className={styles.cellLink} href={detail}>{dateLabel(report.created_at)}</a></td>
      <td><a className={styles.cellLink} href={detail}>{report.technician_name || '-'}</a></td>
      <td><a className={styles.cellLink} href={detail}><Tone info={quality} /><small>{quality.detail}</small></a></td>
      <td><a className={styles.cellLink} href={detail}><span className={`${styles.pill} ${styles[workflow.tone]}`}>{workflow.label}</span></a></td>
      <td><Assignment canAssign={canAssign} report={report} secretaries={secretaries} token={token} /></td>
      <td><a className={styles.cellLink} href={detail}><Tone info={wait} /><small>{wait.detail}</small></a></td>
      {showPdf ? <td>{pdfReady(report) ? <a className={styles.pdf} href={withToken(`/api/admin/reports/${report.id}/pdf`, token)}>PDF</a> : <span className={styles.muted}>—</span>}</td> : null}
      <td><a className={styles.entry} href={detail}>Abrir <span>→</span></a></td>
    </tr>
  );
}
