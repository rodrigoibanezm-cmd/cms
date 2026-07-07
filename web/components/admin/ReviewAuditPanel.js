import styles from '../../app/admin/report/reviewAudit.module.css';
import { auditIssues, confidenceText, guidanceText } from './review_audit_helpers.js';

export function CriticalBox({ audit, report }) {
  const issues = auditIssues(audit);
  return (
    <section className={styles.reviewBox}>
      <div className={styles.boxHeader}>
        <h2>Revisar especialmente</h2>
        <span>{confidenceText(report)}</span>
      </div>
      <p className={styles.muted}>{guidanceText(audit)}</p>
      {!issues.length ? <p className={styles.muted}>Sin alertas del auditor.</p> : null}
      {issues.slice(0, 5).map((issue, index) => (
        <div className={styles.issueBox} key={`${issue.field}-${index}`}>
          <strong>{issue.field || 'Campo'}</strong>
          <p>{issue.reason || '-'}</p>
        </div>
      ))}
    </section>
  );
}

export function AuditPanel({ audit, events }) {
  return (
    <section className={styles.reviewBox}>
      <h2>Informacion tecnica</h2>
      <details className={styles.collapseBox}>
        <summary>Auditor IA</summary>
        <p>Decision: {audit?.decision || 'Sin auditoria'}</p>
        <p>Recovery: {audit?.recovery_applied ? 'aplicado' : 'no aplicado'}</p>
        {(auditIssues(audit) || []).map((issue, index) => (
          <div className={styles.issueBox} key={`${issue.field}-${index}`}>
            <strong>{issue.field || 'Campo'}</strong>
            <p>{issue.reason || '-'}</p>
            <span>{issue.severity || '-'}</span>
          </div>
        ))}
      </details>
      <details className={styles.collapseBox}>
        <summary>Historial</summary>
        <div className={styles.eventList}>
          {events.slice().reverse().map((event, index) => (
            <p key={`${event.event}-${index}`}>{event.event}</p>
          ))}
        </div>
      </details>
    </section>
  );
}