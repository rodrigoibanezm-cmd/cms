import styles from '../../app/admin/assignSecretary.module.css';

function canAssign(report) {
  return ['admin_queue', 'assigned_to_secretary'].includes(report.current_state);
}

export default function AssignSecretaryForm({ report, secretaries, returnTo }) {
  if (!canAssign(report)) return <span className={styles.muted}>No asignable</span>;
  if (!secretaries.length) return <span className={styles.muted}>Sin secretarias</span>;

  return (
    <form className={styles.form} action="/api/admin/reports/assign" method="post">
      <input type="hidden" name="report_id" value={report.id} />
      <input type="hidden" name="return_to" value={returnTo} />
      <select name="secretary_id" defaultValue={report.current_owner_id || ''} required>
        <option value="" disabled>Asignar</option>
        {secretaries.map((secretary) => (
          <option key={secretary.id} value={secretary.id}>{secretary.name}</option>
        ))}
      </select>
      <button type="submit">OK</button>
    </form>
  );
}
