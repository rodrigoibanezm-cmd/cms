import styles from '../../app/admin/report/review.module.css';

function canApprove(report) {
  return !report.approved_at && !report.secretary_approved_at
    && ['assigned_to_secretary', 'admin_queue'].includes(report.current_state);
}

export default function SecretaryApproveForm({ report, tenantId }) {
  if (!canApprove(report) || !tenantId) return null;

  return (
    <form className={styles.approveForm} action={`/api/secretary/reports/${report.id}/approve`} method="post">
      <input type="hidden" name="tenant_id" value={tenantId} />
      <input type="hidden" name="return_to" value={`/admin/report?id=${report.id}&tenant_id=${tenantId}`} />
      <button type="submit">Aprobar</button>
    </form>
  );
}
