import { listReports } from '../../lib/report_reads.js';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const reports = await listReports();

  return (
    <main className="adminScreen">
      <h1>OT procesadas</h1>
      <p>Total: {reports.length}</p>
      <div className="adminList">
        {reports.map((report) => (
          <article className="adminCard" key={report.id}>
            <h2>OT {report.ot || '-'}</h2>
            <p>Estado: {report.status}</p>
            <p>Revision: {report.review_status}</p>
            <p>Semaforo: {report.semaforo || '-'}</p>
            <p>Confidence: {report.confidence_score ?? '-'}</p>
            <p>Template: {report.template_filename || '-'}</p>
            <a href={`/admin/report?id=${report.id}`}>Ver detalle</a>
          </article>
        ))}
      </div>
    </main>
  );
}
