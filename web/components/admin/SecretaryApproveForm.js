import styles from '../../app/admin/report/review.module.css';

function canApprove(report) {
  return !report.approved_at && !report.secretary_approved_at
    && ['assigned_to_secretary', 'admin_queue'].includes(report.current_state);
}

function AdministrativeForm({ report }) {
  if (report.current_state !== 'assigned_to_secretary') return null;
  return (
    <form className={styles.approveForm} action={`/api/secretary/reports/${report.id}/approve`} method="post">
      <input type="hidden" name="secretary_id" value={report.tenant_id || report.current_owner_id || ''} />
      <input type="hidden" name="return_to" value={`/admin/report?id=${report.id}`} />
      <button type="submit">Aprobar administrativa</button>
    </form>
  );
}

function AdminForm({ report }) {
  return (
    <form className={styles.approveForm} action={`/api/admin/reports/${report.id}/approve`} method="post">
      <input type="hidden" name="admin_id" value="admin" />
      <input type="hidden" name="return_to" value={`/admin/report?id=${report.id}`} />
      <button type="submit">Aprobar admin</button>
    </form>
  );
}

export default function SecretaryApproveForm({ report }) {
  if (!canApprove(report)) return null;

  return (
    <div className={styles.approveGroup}>
      <AdministrativeForm report={report} />
      <AdminForm report={report} />
    </div>
  );
}
