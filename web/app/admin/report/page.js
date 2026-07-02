import { getReport } from '../../../lib/report_reads.js';

export const dynamic = 'force-dynamic';

function filesOf(files, kind) {
  return files.filter((file) => file.kind === kind);
}

function auditIssues(audit) {
  return audit?.issues || [];
}

function auditPatches(audit) {
  return audit?.patches || [];
}

function FileList({ title, files }) {
  return (
    <section className="reviewBox">
      <h2>{title}</h2>
      {!files.length ? <p className="muted">Sin archivos registrados.</p> : null}
      {files.map((file) => (
        <div className="fileRow" key={file.id}>
          <span>{file.filename || file.kind}</span>
          {file.url ? <a href={file.url} target="_blank">Abrir</a> : null}
        </div>
      ))}
    </section>
  );
}

function PreviewBox({ title, files }) {
  const file = files[files.length - 1];
  return (
    <section className="reviewBox previewBox">
      <h2>{title}</h2>
      {!file ? <p className="muted">Sin preview generado.</p> : null}
      {file?.url ? (
        <a className="previewLink" href={file.url} target="_blank">
          <span>Ver imagen del XLS</span>
          <small>{file.filename}</small>
        </a>
      ) : null}
    </section>
  );
}

function AuditPanel({ audit, events }) {
  const issues = auditIssues(audit);
  const patches = auditPatches(audit);

  return (
    <section className="reviewBox">
      <h2>Auditor</h2>
      <p><strong>Decisión:</strong> {audit?.decision || 'Sin auditoría'}</p>

      <details className="collapseBox">
        <summary>Issues y sugerencias</summary>
        <h3>Issues</h3>
        {!issues.length ? <p className="muted">Sin issues registrados.</p> : null}
        {issues.map((issue, index) => (
          <div className="issueBox" key={`${issue.field}-${index}`}>
            <strong>{issue.field || 'Campo'}</strong>
            <p>{issue.reason || '-'}</p>
            <span>{issue.severity || '-'}</span>
          </div>
        ))}

        <h3>Correcciones sugeridas</h3>
        {!patches.length ? <p className="muted">Sin parches sugeridos.</p> : null}
        {patches.map((patch, index) => (
          <div className="issueBox" key={`${patch.field}-${index}`}>
            <strong>{patch.field || 'Campo'}</strong>
            <p>{patch.instruction || patch.value || '-'}</p>
          </div>
        ))}
      </details>

      <details className="collapseBox">
        <summary>Historial técnico</summary>
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
  const previews = filesOf(data.files, 'generated_xls_preview');

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

      <div className="reviewLayout">
        <div className="reviewColumn">
          <FileList title="Original" files={originals} />
          <FileList title="Fotos detalle" files={photos} />
        </div>

        <div className="reviewColumn">
          <PreviewBox title="Imagen del XLS" files={previews} />
          <section className="reviewBox xlsBox">
            <h2>XLS generado</h2>
            {report.excel_url ? (
              <a className="adminButton" href={report.excel_url} target="_blank">Abrir XLS</a>
            ) : <p className="muted">XLS pendiente.</p>}
            <div className="fileListSmall">
              {xlsFiles.map((file) => <p key={file.id}>{file.filename}</p>)}
            </div>
          </section>
        </div>

        <div className="reviewColumn">
          <AuditPanel audit={data.audit} events={data.events || []} />
        </div>
      </div>
    </main>
  );
}
