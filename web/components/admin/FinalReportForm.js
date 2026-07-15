import styles from '../../app/admin/report/review.module.css';
import { hasTranscriptionApproval, isEsmeril } from '../../lib/report_final.js';

function withToken(path, token) {
  return token ? `${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : path;
}

export default function FinalReportForm({ report, token, hasFinalReport }) {
  if (!isEsmeril(report) || !hasTranscriptionApproval(report) || hasFinalReport) return null;
  const returnTo = withToken(`/admin/report?id=${report.id}`, token);
  return (
    <form className={styles.approveForm} action={withToken(`/api/secretary/reports/${report.id}/final`, token)} method="post">
      <input type="hidden" name="return_to" value={returnTo} />
      <button type="submit">Generar informe final</button>
    </form>
  );
}
