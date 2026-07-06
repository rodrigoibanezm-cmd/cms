import { Readable } from 'stream';
import { driveClient, downloadDriveFile, env, sheetsClient, uploadDriveFile } from './xls/google_drive.js';

const XLS_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const SHEET_MIME = 'application/vnd.google-apps.spreadsheet';
const PDF_MIME = 'application/pdf';

export const PDF_VERSION = 'main_and_photos_v1';

export function pdfOutputFolderId() {
  return env('GOOGLE_DRIVE_OUTPUT_FOLDER_ID') || env('CANDIDATES_TEMPLATES_FOLDER_ID');
}

function pdfName(report) {
  return `${report.ot || report.id}_FINAL.pdf`;
}

async function uploadAsSheet({ buffer, filename, folderId }) {
  const drive = driveClient();
  const res = await drive.files.create({
    requestBody: { name: filename.replace(/\.xlsx$/i, ''), parents: [folderId], mimeType: SHEET_MIME },
    media: { mimeType: XLS_MIME, body: Readable.from(Buffer.from(buffer)) },
    fields: 'id',
    supportsAllDrives: true,
  });
  return res.data.id;
}

async function visibleSheetUpdates(sheetId) {
  const res = await sheetsClient().spreadsheets.get({ spreadsheetId: sheetId });
  const sheets = res.data.sheets || [];
  const firstId = sheets[0]?.properties?.sheetId;
  return sheets.map(({ properties }) => ({
    updateSheetProperties: {
      properties: { sheetId: properties.sheetId, hidden: !(properties.sheetId === firstId || properties.title === 'FOTOS') },
      fields: 'hidden',
    },
  }));
}

async function keepOnlyMainAndPhotos(sheetId) {
  const requests = await visibleSheetUpdates(sheetId);
  if (!requests.length) return;
  await sheetsClient().spreadsheets.batchUpdate({ spreadsheetId: sheetId, requestBody: { requests } });
}

async function exportSheetPdf(sheetId) {
  const drive = driveClient();
  const res = await drive.files.export(
    { fileId: sheetId, mimeType: PDF_MIME },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data);
}

async function deleteFile(fileId) {
  await driveClient().files.delete({ fileId, supportsAllDrives: true }).catch(console.error);
}

export async function convertXlsDriveFileToPdf({ report, xlsFile }) {
  const folderId = pdfOutputFolderId();
  if (!folderId) throw new Error('Falta carpeta Drive de salida');
  if (!xlsFile?.drive_file_id) throw new Error('XLS sin drive_file_id');

  const xlsBuffer = await downloadDriveFile(xlsFile.drive_file_id);
  const sheetId = await uploadAsSheet({ buffer: xlsBuffer, filename: xlsFile.filename, folderId });
  try {
    await keepOnlyMainAndPhotos(sheetId);
    const pdfBuffer = await exportSheetPdf(sheetId);
    const filename = pdfName(report);
    const uploaded = await uploadDriveFile({ buffer: pdfBuffer, filename, folderId, mimeType: PDF_MIME });
    return { filename, mimeType: PDF_MIME, driveFileId: uploaded.id, url: uploaded.webViewLink };
  } finally {
    await deleteFile(sheetId);
  }
}
