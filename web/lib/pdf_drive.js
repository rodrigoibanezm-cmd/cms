import ExcelJS from 'exceljs';
import { Readable } from 'stream';
import { driveClient, downloadDriveFile, env, uploadDriveFile } from './xls/google_drive.js';

const XLS_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const SHEET_MIME = 'application/vnd.google-apps.spreadsheet';
const PDF_MIME = 'application/pdf';

export const PDF_VERSION = 'main_and_photos_v5';

export function pdfOutputFolderId() {
  return env('GOOGLE_DRIVE_OUTPUT_FOLDER_ID') || env('CANDIDATES_TEMPLATES_FOLDER_ID');
}

function pdfName(report) {
  return `${report.ot || report.id}_FINAL.pdf`;
}

function bumpPdfFontSize(workbook) {
  workbook.worksheets.forEach((sheet) => {
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (!cell.value) return;
        cell.font = { ...(cell.font || {}), size: Math.max(cell.font?.size || 0, 14) };
      });
    });
  });
}

function mainPrintArea(sheet) {
  const start = sheet.dimensions?.top || 1;
  const end = sheet.dimensions?.bottom || sheet.rowCount || 1;
  const left = sheet.dimensions?.left || 1;
  const right = sheet.dimensions?.right || sheet.columnCount || 1;
  return `${sheet.getCell(start, left).address}:${sheet.getCell(end, right).address}`;
}

function tuneMainSheet(sheet) {
  if (!sheet) return;
  sheet.pageSetup = {
    ...(sheet.pageSetup || {}),
    printArea: mainPrintArea(sheet),
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
    paperSize: 9,
    orientation: 'portrait',
    horizontalCentered: true,
    margins: {
      left: 0.15,
      right: 0.15,
      top: 0.2,
      bottom: 0.2,
      header: 0,
      footer: 0,
    },
  };
}

async function printableWorkbookBuffer(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const mainSheet = workbook.worksheets[0];
  const keep = new Set([mainSheet?.id, workbook.getWorksheet('FOTOS')?.id]);
  workbook.worksheets.slice().forEach((sheet) => {
    if (!keep.has(sheet.id)) workbook.removeWorksheet(sheet.id);
  });
  bumpPdfFontSize(workbook);
  tuneMainSheet(mainSheet);
  return Buffer.from(await workbook.xlsx.writeBuffer());
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
  const printBuffer = await printableWorkbookBuffer(xlsBuffer);
  const sheetId = await uploadAsSheet({ buffer: printBuffer, filename: xlsFile.filename, folderId });
  try {
    const pdfBuffer = await exportSheetPdf(sheetId);
    const filename = pdfName(report);
    const uploaded = await uploadDriveFile({ buffer: pdfBuffer, filename, folderId, mimeType: PDF_MIME });
    return { filename, mimeType: PDF_MIME, driveFileId: uploaded.id, url: uploaded.webViewLink };
  } finally {
    await deleteFile(sheetId);
  }
}
