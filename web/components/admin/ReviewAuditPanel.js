function auditIssues(audit) {
  return audit?.issues || [];
}

export function CriticalBox({ audit, styles }) {
  const issues = auditIssues(audit);
  return (
    <section className={styles.reviewBox}>
      <h2>Revisar especialmente</h2>
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

export function AuditPanel({ audit, events, styles }) {
  return (
    <section className={styles.reviewBox}>
      <h2>Información técnica</h2>
      <details className={styles.collapseBox}>
        <summary>Auditor IA</summary>
        <p><strong>Decisión:</strong> {audit?.decision || 'Sin auditoría'}</p>
        {(audit?.issues || []).map((issue, index) => (
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
