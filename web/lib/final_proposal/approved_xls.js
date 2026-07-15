import { downloadDriveFile } from '../xls/google_drive.js';
import { loadTemplateWorkbook } from '../xls/template_loader.js';
import { cellText, norm, writableCell } from '../xls/cell_utils.js';

function printable(value) {
  if (value?.richText) return value.richText.map((part) => part.text).join('');
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object' && value?.result !== undefined) return value.result;
  return String(value ?? '').trim();
}

function sheetText(sheet) {
  const lines = [`HOJA: ${sheet.name}`];
  sheet.eachRow((row, rowNumber) => {
    const cells = [];
    row.eachCell({ includeEmpty: false }, (cell) => {
      const target = writableCell(cell);
      if (target.address !== cell.address) return;
      const value = printable(cellText(target));
      if (value) cells.push(`${target.address}=${value}`);
    });
    if (cells.length) lines.push(`FILA ${rowNumber}: ${cells.join(' | ')}`);
  });
  return lines.join('\n');
}

export async function approvedXlsText(file) {
  if (!file?.drive_file_id) throw new Error('XLS aprobado no encontrado');
  const buffer = await downloadDriveFile(file.drive_file_id);
  const workbook = await loadTemplateWorkbook(buffer, file.filename || 'transcripcion.xlsx');
  return approvedWorkbookText(workbook);
}

export function approvedWorkbookText(workbook) {
  const sheets = workbook.worksheets.filter((sheet) => norm(sheet.name) !== 'EXTRACCION_JSON');
  if (!sheets.length) throw new Error('XLS aprobado sin contenido legible');
  return sheets.map(sheetText).join('\n\n').slice(0, 80000);
}
