import { summaryItems } from '../admin_v2_summary_helpers.js';
import styles from '../../../app/admin-v2/summary.module.css';

export default function KPIBar({ reports }) {
  return (
    <section className={styles.summary}>
      {summaryItems(reports).map(([icon, value, label]) => (
        <div className={styles.item} key={label}>
          <span aria-hidden="true">{icon}</span>
          <div><strong>{value}</strong><small>{label}</small></div>
        </div>
      ))}
    </section>
  );
}
