import styles from '../../app/admin/operationFooter.module.css';

export default function OperationFooter({ count }) {
  return (
    <footer className={styles.footer}>
      <span>Mostrando 1 a {count} resultados</span>
      <div className={styles.pages}>
        <span>20 por página</span>
        <strong>1</strong>
      </div>
    </footer>
  );
}