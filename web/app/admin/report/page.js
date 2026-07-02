import { getReport } from '../../../lib/report_reads.js';

export const dynamic = 'force-dynamic';

export default async function AdminReportPage({ searchParams }) {
  const id = searchParams.id;
  const data = id ? await getReport(id) : { report: null, files: [] };
  const report = data.report;

  return (
    <main className="adminScreen">
      <a href="/admin">Volver</a>
      {!report ? <p>Reporte no encontrado.</p> : (
        <>
          <h1>OT {report.ot || '-'}</h1>
          <section className="adminCard">
            <p>Estado: {report.status}</p>
            <p>Revision: {report.review_status}</p>
            <p>Semaforo: {report.semaforo || '-'}</p>
            <p>Confidence: {report.confidence_score ?? '-'}</p>
            <p>Template: {report.template_filename || '-'}</p>
            {report.excel_url ? <p><a href={report.excel_url}>Abrir Excel generado</a></p> : null}
          </section>
          <section className="adminCard">
            <h2>Archivos</h2>
            {data.files.map((file) => <p key={file.id}>{file.kind}: {file.filename}</p>)}
          </section>
        </>
      )}
    </main>
  );
}
