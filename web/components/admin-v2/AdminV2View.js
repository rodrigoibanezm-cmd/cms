import Footer from './Footer/index.js';
import Header from './Header/index.js';
import KPIBar from './KPIBar/index.js';
import Queue from './Queue/index.js';
import Status from './Status/index.js';
import styles from '../../app/admin-v2/adminV2.module.css';

export default function AdminV2View({
  capabilities,
  filters,
  hasProcessing,
  label,
  reports,
  secretaries,
}) {
  return (
    <main className={styles.screen}>
      <div className={styles.content}>
        <Status active={hasProcessing} />
        <Header capabilities={capabilities} filters={filters} label={label} />
        <KPIBar reports={reports} />
        <Queue
          {...capabilities}
          reports={reports}
          secretaries={secretaries}
          token={filters.token}
        />
        <Footer count={reports.length} />
      </div>
    </main>
  );
}
