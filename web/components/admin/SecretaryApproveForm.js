import styles from '../../app/admin/report/review.module.css';

function canApprove(report) {
  return report.current_state === 'assigned_to_secretary' && !report.secretary_approved_at;
}

export default function SecretaryApproveForm({ report }) {
  if (!canApprove(report)) return null;

  return (
    <form className={styles.approveForm} action={`/api/secretary/reports/${report.id}/approve`} method="post">
      <input type="hidden" name="secretary_id" value={report.tenant_id || report.current_owner_id || ''} />
      <input type="hidden" name="return_to" value={`/admin/report?id=${report.id}`} />
      <button type="submit">Aprobar OT</button>
    </form>
  );
}
