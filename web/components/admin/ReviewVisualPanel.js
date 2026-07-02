'use client';

import { useState } from 'react';
import styles from '../../app/admin/report/reviewVisual.module.css';

const ZOOM = 3;
const LENS_SIZE = 190;

function filePreviewUrl(file) {
  return file?.drive_file_id ? `/api/report-file?id=${file.id}` : '';
}

function isImage(file) {
  return String(file?.mime_type || '').startsWith('image/');
}

function compactSheetsUrl(url) {
  if (!url) return '';
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}rm=minimal&single=true&widget=false&chrome=false`;
}

function MagnifiedImage({ src, alt }) {
  const [lens, setLens] = useState(null);

  function moveLens(event) {
    const stageRect = event.currentTarget.getBoundingClientRect();
    const img = event.currentTarget.querySelector('img');
    const imgRect = img.getBoundingClientRect();
    const imgX = event.clientX - imgRect.left;
    const imgY = event.clientY - imgRect.top;

    if (imgX < 0 || imgY < 0 || imgX > imgRect.width || imgY > imgRect.height) {
      setLens(null);
      return;
    }

    setLens({
      left: event.clientX - stageRect.left,
      top: event.clientY - stageRect.top,
      bgSize: `${imgRect.width * ZOOM}px ${imgRect.height * ZOOM}px`,
      bgPosition: `${-(imgX * ZOOM - LENS_SIZE / 2)}px ${-(imgY * ZOOM - LENS_SIZE / 2)}px`,
    });
  }

  return (
    <div className={styles.imageStage} onMouseMove={moveLens} onMouseLeave={() => setLens(null)}>
      <img className={styles.reviewImage} src={src} alt={alt} />
      {lens ? (
        <div
          className={styles.imageLens}
          style={{
            left: `${lens.left}px`,
            top: `${lens.top}px`,
            backgroundImage: `url(${src})`,
            backgroundSize: lens.bgSize,
            backgroundPosition: lens.bgPosition,
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
  const frameUrl = compactSheetsUrl(report.excel_url);
  return (
    <section className={`${styles.reviewBox} ${styles.visualBox} ${styles.xlsBox}`}>
      <h2>XLS generado</h2>
      {frameUrl ? (
        <iframe className={styles.xlsFrame} src={frameUrl} title="XLS generado" />
      ) : <p className={styles.muted}>XLS pendiente.</p>}
      <div className={styles.adminActions}>
        {report.excel_url ? <a className={styles.adminButton} href={report.excel_url} target="_blank">Abrir XLS</a> : null}
      </div>
      {xls ? <p className={styles.muted}>{xls.filename}</p> : null}
    </section>
  );
}
