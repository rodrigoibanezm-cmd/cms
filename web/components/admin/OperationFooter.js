import styles from '../../app/admin/operationFooter.module.css';

function rangeLabel(count) {
  if (!count) return 'Sin resultados';
  return `Mostrando 1 a ${count} resultados`;
}

export default function OperationFooter({ count }) {
  return (
    <footer className={styles.footer}>
      <span>{rangeLabel(count)}</span>
      <div className={styles.pages}>
        <span>20 por página</span>
        <strong>1</strong>
      </div>
    </footer>
  );
}