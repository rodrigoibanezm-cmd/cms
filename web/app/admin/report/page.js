import { getReport } from '../../../lib/report_reads.js';

export const dynamic = 'force-dynamic';

function filesOf(files, kind) {
  return files.filter((file) => file.kind === kind);
}

function auditIssues(audit) {
  return audit?.issues || [];
}

function VisualFile({ title, files }) {
  const file = files[files.length - 1];
  return (
    <section className="reviewBox visualBox">
      <h2>{title}</h2>
      {!file ? <p className="muted">Sin archivo visible.</p> : null}
      {file?.url ? (
        <iframe className="driveFrame" src={file.url} title={title} />
      ) : (
        file ? <p className="muted">{file.filename}</p> : null
      )}
      {files.length > 1 ? (
        <details className="collapseBox">
          <summary>Ver otros archivos</summary>
          {files.map((item) => <p className="muted" key={item.id}>{item.filename}</p>)}
        </details>
      ) : null}
    </section>
  );
}

function XlsPanel({ report, files }) {
  const xls = files[files.length - 1];
  return (
    <section className="reviewBox visualBox">
      <h2>XLS generado</h2>
      {report.excel_url ? (
        <iframe className="driveFrame" src={report.excel_url} title="XLS generado" />
      ) : <p className="muted">XLS pendiente.</p>}
      <div className="adminActions">
        {report.excel_url ? <a className="adminButton" href={report.excel_url} target="_blank">Abrir XLS</a> : null}
      </div>
      {xls ? <p className="muted">{xls.filename}</p> : null}
    </section>
  );
}

function CriticalBox({ audit }) {
  const issues = auditIssues(audit);
  return (
    <section className="reviewBox">
      <h2>Revisar especialmente</h2>
      {!issues.length ? <p className="muted">Sin alertas del auditor.</p> : null}
      {issues.slice(0, 5).map((issue, index) => (
        <div className="issueBox" key={`${issue.field}-${index}`}>
          <strong>{issue.field || 'Campo'}</strong>
          <p>{issue.reason || '-'}</p>
        </div>
      ))}
    </section>
  );
}

function AuditPanel({ audit, events }) {
  return (
    <section className="reviewBox">
      <h2>Información técnica</h2>
      <details className="collapseBox">
        <summary>Auditor IA</summary>
        <p><strong>Decisión:</strong> {audit?.decision || 'Sin auditoría'}</p>
        {(audit?.issues || []).map((issue, index) => (
          <div className="issueBox" key={`${issue.field}-${index}`}>
            <strong>{issue.field || 'Campo'}</strong>
            <p>{issue.reason || '-'}</p>
            <span>{issue.severity || '-'}</span>
          </div>
        ))}
      </details>
      <details className="collapseBox">
        <summary>Historial</summary>
        <div className="eventList">
          {events.slice().reverse().map((event, index) => (
            <p key={`${event.event}-${index}`}>{event.event}</p>
          ))}
        </div>
      </details>
    </section>
  );
}

export default async function AdminReportPage({ searchParams }) {
  const params = await searchParams;
  const id = params?.id;
  const data = id ? await getReport(id) : { report: null, files: [], events: [] };
  const report = data.report;

  if (!report) {
    return (
      <main className="adminScreen">
        <a className="adminLink" href="/admin">Volver</a>
        <p>Reporte no encontrado.</p>
      </main>
    );
  }

  const originals = filesOf(data.files, 'original_report');
  const photos = filesOf(data.files, 'detail_photo');
  const xlsFiles = filesOf(data.files, 'generated_xls');

  return (
    <main className="reviewScreen">
      <header className="reviewHeader">
        <a className="adminLink" href="/admin">Volver</a>
        <h1>Revisión OT {report.ot || '-'}</h1>
        <div className="reviewMeta">
          <span>{report.semaforo || 'SIN SEMÁFORO'}</span>
          <span>{report.review_status}</span>
          <span>{report.confidence_score ?? '-'}%</span>
        </div>
      </header>

      <div className="reviewMainGrid">
        <VisualFile title="Informe original" files={originals} />
        <XlsPanel report={report} files={xlsFiles} />
      </div>

      <div className="reviewSecondaryGrid">
        <VisualFile title="Fotos detalle" files={photos} />
        <CriticalBox audit={data.audit} />
        <AuditPanel audit={data.audit} events={data.events || []} />
      </div>
    </main>
  );
}
