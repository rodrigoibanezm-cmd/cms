import { AuditPanel, CriticalBox } from '../../../components/admin/ReviewAuditPanel.js';
import { VisualFile, XlsPanel } from '../../../components/admin/ReviewVisualPanel.js';
import SecretaryApproveForm from '../../../components/admin/SecretaryApproveForm.js';
import { workflowLabel } from '../../../components/admin/admin_helpers.js';
import { getReport } from '../../../lib/report_reads.js';
import styles from './review.module.css';

export const dynamic = 'force-dynamic';

function filesOf(files, kind) {
  return files.filter((file) => file.kind === kind);
}

function confidenceLabel(report) {
  if (report.confidence_score === null || report.confidence_score === undefined) return 'Confianza IA: -';
  return `Confianza IA: ${report.confidence_score}%`;
}

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

  const originals = filesOf(data.files, 'original_report');
  const photos = filesOf(data.files, 'detail_photo');
  const xlsFiles = filesOf(data.files, 'generated_xls');

  return (
    <main className={styles.reviewScreen}>
      <header className={styles.reviewHeader}>
        <a className={styles.backLink} href="/admin">Volver</a>
        <div className={styles.reviewTopBar}>
          <div>
            <h1>Revision OT {report.ot || '-'}</h1>
            <div className={styles.reviewMeta}>
              <span>{workflowLabel(report.current_state)}</span>
              <span>{confidenceLabel(report)}</span>
            </div>
          </div>
          <SecretaryApproveForm report={report} />
        </div>
      </header>
      <CriticalBox audit={data.audit} report={report} />
      <div className={styles.reviewMainGrid}>
        <VisualFile title="Informe original" files={originals} />
        <XlsPanel report={report} files={xlsFiles} />
      </div>
      <div className={styles.reviewSecondaryGrid}>
        <VisualFile title="Fotos detalle" files={photos} />
        <AuditPanel audit={data.audit} events={data.events || []} />
      </div>
    </main>
  );
}