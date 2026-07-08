import styles from '../../app/admin/report/review.module.css';

function canApprove(report) {
  return !report.approved_at && !report.secretary_approved_at
    && ['assigned_to_secretary', 'admin_queue'].includes(report.current_state);
}

function withToken(path, token) {
  return token ? `${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : path;
}

export default function SecretaryApproveForm({ report, token }) {
  if (!canApprove(report)) return null;
  const returnTo = withToken(`/admin/report?id=${report.id}`, token);

  return (
    <form className={styles.approveForm} action={withToken(`/api/secretary/reports/${report.id}/approve`, token)} method="post">
      <input type="hidden" name="return_to" value={returnTo} />
      <button type="submit">Aprobar</button>
    </form>
  );
}
