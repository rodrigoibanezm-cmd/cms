import styles from '../../app/admin/report/review.module.css';

function canApprove(report) {
  return !report.approved_at && !report.secretary_approved_at
    && ['assigned_to_secretary', 'admin_queue'].includes(report.current_state);
}

function actorTenantId(report) {
  return report.tenant_id || report.current_owner_id || '';
}

export default function SecretaryApproveForm({ report }) {
  if (!canApprove(report)) return null;

  return (
    <form className={styles.approveForm} action={`/api/secretary/reports/${report.id}/approve`} method="post">
      <input type="hidden" name="tenant_id" value={actorTenantId(report)} />
      <input type="hidden" name="return_to" value={`/admin/report?id=${report.id}`} />
      <button type="submit">Aprobar</button>
    </form>
  );
}
