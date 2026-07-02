import ExcelJS from 'exceljs';
import { env, uploadDriveFile } from './xls/google_drive.js';

const CELL_W = 92;
const CELL_H = 24;
const MAX_COLS = 10;
const MAX_ROWS = 42;

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cellText(cell) {
  const value = cell?.value;
  if (value == null) return '';
  if (typeof value === 'object') return value.text || value.result || '';
  return String(value);
}

function rowSvg(row, rowIndex) {
  const y = (rowIndex - 1) * CELL_H;
  let out = '';
  for (let col = 1; col <= MAX_COLS; col += 1) {
    const x = (col - 1) * CELL_W;
    const text = cellText(row.getCell(col)).slice(0, 24);
    out += `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" fill="white" stroke="#d6dde6"/>`;
    if (text) out += `<text x="${x + 5}" y="${y + 16}" font-size="11" fill="#132033">${escapeXml(text)}</text>`;
  }
  return out;
}

export async function renderXlsPreviewSvg(xls) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(xls.buffer);
  const sheet = workbook.worksheets[0];
  const width = CELL_W * MAX_COLS;
  const height = CELL_H * MAX_ROWS;
  let rows = '';

  for (let rowIndex = 1; rowIndex <= MAX_ROWS; rowIndex += 1) {
    rows += rowSvg(sheet.getRow(rowIndex), rowIndex);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${rows}</svg>`;
  return Buffer.from(svg, 'utf8');
}

export async function publishXlsPreview({ xls, extraction }) {
  const folderId = env('GOOGLE_DRIVE_OUTPUT_FOLDER_ID') || env('CANDIDATES_TEMPLATES_FOLDER_ID');
  if (!folderId) throw new Error('Falta carpeta Drive de salida');
  const buffer = await renderXlsPreviewSvg(xls);
  const filename = xls.filename.replace(/\.xlsx$/i, '_PREVIEW.svg');
  const uploaded = await uploadDriveFile({
    buffer,
    filename,
    folderId,
    mimeType: 'image/svg+xml',
  });
  console.log('[xls-preview] uploaded', { ot: extraction?.ot, filename });
  return {
    filename,
    drive_file_id: uploaded.id,
    url: uploaded.webViewLink,
    mime_type: 'image/svg+xml',
  };
}
