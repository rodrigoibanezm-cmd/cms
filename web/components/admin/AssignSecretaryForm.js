import styles from '../../app/admin/assignSecretary.module.css';

function canAssign(report) {
  if (report.closed_at || report.approved_at || report.secretary_approved_at) return false;
  if (!report.current_state) return true;
  if (['admin_queue', 'assigned_to_secretary', 'secretary_review'].includes(report.current_state)) return true;
  return report.current_state === 'processing' && Boolean(report.excel_url || report.status === 'processed');
}

function buttonLabel(report) {
  return report.current_owner_id ? 'Reasignar' : 'Asignar';
}

function formClass(compact) {
  return compact ? `${styles.form} ${styles.compact}` : styles.form;
}

export default function AssignSecretaryForm({ report, secretaries, action, returnTo, compact = false }) {
  if (!canAssign(report)) return <span className={styles.muted}>{report.tenant_name || 'No editable'}</span>;
  if (!secretaries.length) return <span className={styles.muted}>Sin administrativas</span>;

  return (
    <form className={formClass(compact)} action={action} method="post">
      <input type="hidden" name="report_id" value={report.id} />
      <input type="hidden" name="return_to" value={returnTo} />
      <label className={styles.field}>
        <span>Administrativa</span>
        <select name="secretary_id" defaultValue={report.current_owner_id || ''} required>
          <option value="" disabled>Seleccionar</option>
          {secretaries.map((secretary) => (
            <option key={secretary.id} value={secretary.id}>{secretary.name}</option>
          ))}
        </select>
      </label>
      <button type="submit">{buttonLabel(report)}</button>
    </form>
  );
}
