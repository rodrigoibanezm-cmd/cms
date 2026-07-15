import styles from '../../../app/admin-v2/footer.module.css';

export default function Footer({ count }) {
  return (
    <footer className={styles.footer}>
      <span>{count ? `Mostrando 1 a ${count} resultados` : 'Sin resultados'}</span>
      <span>20 por página · <strong>1</strong></span>
    </footer>
  );
}
