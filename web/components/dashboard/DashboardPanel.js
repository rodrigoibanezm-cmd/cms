import styles from '../../app/dashboard/dashboard.module.css';

function valueLabel(value) {
  if (value === null || value === undefined) return '-';
  return value;
}

export default function DashboardPanel({ title, items }) {
  return (
    <section className={styles.panel}>
      <h2>{title}</h2>
      {items.map(([label, value]) => (
        <div className={styles.row} key={label}>
          <span>{label}</span>
          <strong>{valueLabel(value)}</strong>
        </div>
      ))}
    </section>
  );
}
