'use client';

import { useEffect, useState } from 'react';
import styles from '../../app/admin/report/reviewVisual.module.css';

function filePreviewUrl(file, token) {
  if (!file?.drive_file_id) return '';
  const qs = new URLSearchParams({ id: file.id });
  if (token) qs.set('token', token);
  return `/api/report-file?${qs.toString()}`;
}

function isImage(file) {
  return String(file?.mime_type || '').startsWith('image/');
}

function ZoomedImage({ src, alt }) {
  return <div className={styles.imageStage}><img className={styles.reviewImage} src={src} alt={alt} /></div>;
}

function XlsViewport({ frameUrl }) {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!hovered) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [hovered]);
  return <div className={styles.xlsViewport} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}><iframe className={styles.xlsFrame} src={frameUrl} title="XLS generado" /></div>;
}

export function VisualFile({ title, files, token }) {
  const file = files[files.length - 1];
  const preview = filePreviewUrl(file, token);
  return (
    <section className={`${styles.reviewBox} ${styles.visualBox}`}>
      <h2>{title}</h2>
      {!file ? <p className={styles.muted}>Sin archivo visible.</p> : null}
      {preview && isImage(file) ? <ZoomedImage src={preview} alt={title} /> : file?.url ? <iframe className={styles.driveFrame} src={file.url} title={title} /> : (file ? <p className={styles.muted}>{file.filename}</p> : null)}
      {file?.url ? <div className={styles.adminActions}><a className={styles.adminButton} href={file.url} target="_blank">Abrir original</a></div> : null}
      {files.length > 1 ? <details className={styles.collapseBox}><summary>Ver otros archivos</summary>{files.map((item) => <p className={styles.muted} key={item.id}>{item.filename}</p>)}</details> : null}
    </section>
  );
}

export function XlsPanel({ report, files }) {
  const xls = files[files.length - 1];
  const xlsUrl = report.excel_url || xls?.url || '';
  return (
    <section className={`${styles.reviewBox} ${styles.visualBox} ${styles.xlsBox}`}>
      <h2>XLS generado</h2>
      {xlsUrl ? <XlsViewport frameUrl={xlsUrl} /> : <p className={styles.muted}>XLS pendiente.</p>}
      {xlsUrl ? <p className={styles.muted}>Si la vista de Drive no carga, abre el XLS directamente.</p> : null}
      <div className={styles.adminActions}>{xlsUrl ? <a className={styles.adminButton} href={xlsUrl} target="_blank">Abrir XLS</a> : null}</div>
      {xls ? <p className={styles.muted}>{xls.filename}</p> : null}
    </section>
  );
}

export function FinalReportPanel({ files }) {
  const xls = files[files.length - 1];
  return (
    <section className={`${styles.reviewBox} ${styles.visualBox} ${styles.xlsBox}`}>
      <h2>Informe final (pendiente de aprobación)</h2>
      {xls?.url ? <XlsViewport frameUrl={xls.url} /> : <p className={styles.muted}>Informe final pendiente.</p>}
      {xls?.url ? <div className={styles.adminActions}><a className={styles.adminButton} href={xls.url} target="_blank">Abrir informe final</a></div> : null}
      {xls ? <p className={styles.muted}>{xls.filename}</p> : null}
    </section>
  );
}
