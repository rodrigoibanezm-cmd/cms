import { addReportFile } from './report_store.js';
import { env, uploadDriveFile } from './xls/google_drive.js';

function inputFolderId() {
  return env('GOOGLE_DRIVE_INPUT_FOLDER_ID')
    || env('GOOGLE_DRIVE_OUTPUT_FOLDER_ID')
    || env('CANDIDATES_TEMPLATES_FOLDER_ID');
}

function safeName(value, fallback) {
  return String(value || fallback).replace(/[\\/:*?"<>|]/g, '_');
}

async function uploadReportFile({ reportId, kind, file, buffer, fallbackName }) {
  const folderId = inputFolderId();
  if (!folderId) throw new Error('Falta carpeta Drive para archivos de entrada');

  const filename = safeName(file?.name, fallbackName);
  const mimeType = file?.type || 'image/jpeg';
  const uploaded = await uploadDriveFile({ buffer, filename, folderId, mimeType });

  await addReportFile(reportId, {
    kind,
    filename,
    mimeType,
    driveFileId: uploaded.id,
    url: uploaded.webViewLink,
  });

  return { filename, drive_file_id: uploaded.id, url: uploaded.webViewLink };
}

export async function uploadInputFiles({ reportId, reportFile, reportBuffer, photoPayload }) {
  await uploadReportFile({
    reportId,
    kind: 'original_report',
    file: reportFile,
    buffer: reportBuffer,
    fallbackName: 'informe.jpg',
  });

  await Promise.all(photoPayload.map((photo, index) => uploadReportFile({
    reportId,
    kind: 'detail_photo',
    file: { name: photo.filename, type: photo.mimeType },
    buffer: photo.buffer,
    fallbackName: `foto_${index + 1}.jpg`,
  })));
}
