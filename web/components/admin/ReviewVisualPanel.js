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

function compactSheetsUrl(url) {
  if (!url) return '';
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}rm=minimal&single=true&widget=false&chrome=false`;
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
  return (
    <div className={styles.xlsViewport} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <iframe className={styles.xlsFrame} src={frameUrl} title="XLS generado" />
    </div>
  );
}

export function VisualFile({ title, files, token }) {
  const file = files[files.length - 1];
  const previewUrl = filePreviewUrl(file, token);
  return (
    <section className={`${styles.reviewBox} ${styles.visualBox}`}>
      <h2>{title}</h2>
      {!file ? <p className={styles.muted}>Sin archivo visible.</p> : null}
      {previewUrl && isImage(file) ? <ZoomedImage src={previewUrl} alt={title} /> : file?.url ? (
        <iframe className={styles.driveFrame} src={file.url} title={title} />
      ) : (file ? <p className={styles.muted}>{file.filename}</p> : null)}
      {file?.url ? <div className={styles.adminActions}><a className={styles.adminButton} href={file.url} target="_blank">Abrir original</a></div> : null}
      {files.length > 1 ? (
        <details className={styles.collapseBox}>
          <summary>Ver otros archivos</summary>
          {files.map((item) => <p className={styles.muted} key={item.id}>{item.filename}</p>)}
        </details>
      ) : null}
    </section>
  );
}

export function XlsPanel({ report, files }) {
  const xls = files[files.length - 1];
  const frameUrl = compactSheetsUrl(report.excel_url);
  return (
    <section className={`${styles.reviewBox} ${styles.visualBox} ${styles.xlsBox}`}>
      <h2>XLS generado</h2>
      {frameUrl ? <XlsViewport frameUrl={frameUrl} /> : <p className={styles.muted}>XLS pendiente.</p>}
      <div className={styles.adminActions}>
        {report.excel_url ? <a className={styles.adminButton} href={report.excel_url} target="_blank">Abrir XLS</a> : null}
      </div>
      {xls ? <p className={styles.muted}>{xls.filename}</p> : null}
    </section>
  );
}
