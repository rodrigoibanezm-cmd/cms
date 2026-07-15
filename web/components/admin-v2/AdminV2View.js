import Footer from './Footer/index.js';
import Header from './Header/index.js';
import KPIBar from './KPIBar/index.js';
import Queue from './Queue/index.js';
import Status from './Status/index.js';
import styles from '../../app/admin/admin.module.css';

export default function AdminV2View({
  filters,
  hasProcessing,
  label,
  reports,
  secretaries,
}) {
  return (
    <main className={styles.adminScreen}>
      <Status active={hasProcessing} />
      <Header filters={filters} label={label} />
      <KPIBar reports={reports} />
      <Queue reports={reports} secretaries={secretaries} token={filters.token} />
      <Footer count={reports.length} />
    </main>
  );
}
