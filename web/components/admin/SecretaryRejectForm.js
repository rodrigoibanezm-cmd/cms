import styles from '../../app/admin/report/review.module.css';

function canReject(report) {
  if (report.closed_at || report.approved_at || report.secretary_approved_at || report.rejected_at) return false;
  return ['assigned_to_secretary', 'admin_queue', 'secretary_review'].includes(report.current_state);
}

function withToken(path, token) {
  return token ? `${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : path;
}

export default function SecretaryRejectForm({ report, token, returnTo }) {
  if (!canReject(report)) return null;
  const target = returnTo || `/admin/report?id=${report.id}`;

  return (
    <details className={styles.rejectPanel}>
      <summary>Rechazar</summary>
      <form action={withToken(`/api/secretary/reports/${report.id}/reject`, token)} method="post">
        <input type="hidden" name="return_to" value={withToken(target, token)} />
        <label>
          <span>Motivo breve</span>
          <textarea name="reason" rows="3" placeholder="Opcional" />
        </label>
        <div className={styles.rejectActions}>
          <button type="submit">Confirmar rechazo</button>
        </div>
      </form>
    </details>
  );
}
