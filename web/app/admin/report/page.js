import { AuditPanel, CriticalBox } from '../../../components/admin/ReviewAuditPanel.js';
import { getReviewFiles, VisualFile, XlsPanel } from '../../../components/admin/ReviewVisualPanel.js';
import { getReport } from '../../../lib/report_reads.js';
import styles from './review.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminReportPage({ searchParams }) {
  const params = await searchParams;
  const id = params?.id;
  const data = id ? await getReport(id) : { report: null, files: [], events: [] };
  const report = data.report;

  if (!report) {
    return (
      <main className={styles.reviewScreen}>
        <a className={styles.backLink} href="/admin">Volver</a>
        <p>Reporte no encontrado.</p>
      </main>
    );
  }

  const { originals, photos, xlsFiles } = getReviewFiles(data.files);

  return (
    <main className={styles.reviewScreen}>
      <header className={styles.reviewHeader}>
        <a className={styles.backLink} href="/admin">Volver</a>
        <h1>Revisión OT {report.ot || '-'}</h1>
        <div className={styles.reviewMeta}>
          <span>{report.semaforo || 'SIN SEMÁFORO'}</span>
          <span>{report.review_status}</span>
          <span>{report.confidence_score ?? '-'}%</span>
        </div>
      </header>
      <div className={styles.reviewMainGrid}>
        <VisualFile title="Informe original" files={originals} />
        <XlsPanel report={report} files={xlsFiles} />
      </div>
      <div className={styles.reviewSecondaryGrid}>
        <VisualFile title="Fotos detalle" files={photos} />
        <CriticalBox audit={data.audit} />
        <AuditPanel audit={data.audit} events={data.events || []} />
      </div>
    </main>
  );
}
