'use client';

import { useState } from 'react';
import styles from '../../app/admin/report/reviewVisual.module.css';

function filePreviewUrl(file) {
  return file?.drive_file_id ? `/api/report-file?id=${file.id}` : '';
}

function isImage(file) {
  return String(file?.mime_type || '').startsWith('image/');
}

function MagnifiedImage({ src, alt }) {
  const [lens, setLens] = useState(null);

  function moveLens(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setLens({ x, y });
  }

  return (
    <div
      className={styles.imageStage}
      onMouseMove={moveLens}
      onMouseLeave={() => setLens(null)}
    >
      <img className={styles.reviewImage} src={src} alt={alt} />
      {lens ? (
        <div
          className={styles.imageLens}
          style={{
            left: `${lens.x}%`,
            top: `${lens.y}%`,
            backgroundImage: `url(${src})`,
            backgroundPosition: `${lens.x}% ${lens.y}%`,
          }}
        />
      ) : null}
    </div>
  );
}

export function VisualFile({ title, files }) {
  const file = files[files.length - 1];
  const previewUrl = filePreviewUrl(file);
  return (
    <section className={`${styles.reviewBox} ${styles.visualBox}`}>
      <h2>{title}</h2>
      {!file ? <p className={styles.muted}>Sin archivo visible.</p> : null}
      {previewUrl && isImage(file) ? (
        <MagnifiedImage src={previewUrl} alt={title} />
      ) : file?.url ? (
        <iframe className={styles.driveFrame} src={file.url} title={title} />
      ) : (
        file ? <p className={styles.muted}>{file.filename}</p> : null
      )}
      {file?.url ? (
        <div className={styles.adminActions}>
          <a className={styles.adminButton} href={file.url} target="_blank">Abrir original</a>
        </div>
      ) : null}
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
  return (
    <section className={`${styles.reviewBox} ${styles.visualBox}`}>
      <h2>XLS generado</h2>
      {report.excel_url ? (
        <iframe className={styles.driveFrame} src={report.excel_url} title="XLS generado" />
      ) : <p className={styles.muted}>XLS pendiente.</p>}
      <div className={styles.adminActions}>
        {report.excel_url ? <a className={styles.adminButton} href={report.excel_url} target="_blank">Abrir XLS</a> : null}
      </div>
      {xls ? <p className={styles.muted}>{xls.filename}</p> : null}
    </section>
  );
}
