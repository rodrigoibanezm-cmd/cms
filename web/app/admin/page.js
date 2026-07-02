import { listReports } from '../../lib/report_reads.js';

export const dynamic = 'force-dynamic';

function semaforoClass(value) {
  if (value === 'VERDE') return 'pill green';
  if (value === 'ROJO') return 'pill red';
  return 'pill yellow';
}

function reviewLabel(value) {
  if (value === 'approved') return 'Aprobado';
  if (value === 'recover') return 'Corrección IA';
  if (value === 'review') return 'Revisar';
  if (value === 'rejected') return 'Rechazado';
  return value || 'Pendiente';
}

export default async function AdminPage() {
  const reports = await listReports();

  return (
    <main className="adminScreen">
      <header className="adminHeader">
        <p className="eyebrow">CM Services</p>
        <h1>Admin de informes</h1>
        <p className="subtitle">Listado de OTs procesadas para revisar y aprobar.</p>
      </header>

      <section className="adminSummary">
        <strong>{reports.length}</strong>
        <span>OTs cargadas</span>
      </section>

      <div className="adminList">
        {reports.map((report) => (
          <article className="adminCard" key={report.id}>
            <div className="adminCardTop">
              <div>
                <p className="adminKicker">OT</p>
                <h2>{report.ot || '-'}</h2>
              </div>
              <span className={semaforoClass(report.semaforo)}>{report.semaforo || 'SIN DATO'}</span>
            </div>

            <div className="adminGrid">
              <div><span>Estado</span><strong>{report.status}</strong></div>
              <div><span>Revisión</span><strong>{reviewLabel(report.review_status)}</strong></div>
              <div><span>Confianza</span><strong>{report.confidence_score ?? '-'}</strong></div>
              <div><span>XLS</span><strong>{report.excel_url ? 'Listo' : 'Pendiente'}</strong></div>
            </div>

            <p className="adminTemplate">{report.template_filename || 'Sin template'}</p>

            <div className="adminActions">
              <a className="adminButton" href={`/admin/report?id=${report.id}`}>Ver revisión</a>
              {report.excel_url ? (
                <a className="adminLink" href={report.excel_url} target="_blank">Abrir XLS</a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
