import { createHash } from 'crypto';
import ExcelJS from 'exceljs';
import XlsxPopulate from 'xlsx-populate';

function bufferInfo(buffer, filename) {
  return {
    filename,
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    firstBytes: buffer.subarray(0, 16).toString('hex'),
    startsWithZip: buffer[0] === 0x50 && buffer[1] === 0x4b,
  };
}

async function diagnoseWithXlsxPopulate(buffer) {
  try {
    const workbook = await XlsxPopulate.fromDataAsync(buffer);
    return {
      ok: true,
      sheets: workbook.sheets().map((sheet) => sheet.name()),
    };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || String(err),
      stack: err?.stack || null,
    };
  }
}

export async function loadTemplateWorkbook(buffer, filename) {
  const workbook = new ExcelJS.Workbook();
  const info = bufferInfo(buffer, filename);
  console.log('[xls] template bytes', info);

  try {
    await workbook.xlsx.load(buffer);
  } catch (err) {
    const alternateParser = await diagnoseWithXlsxPopulate(buffer);
    console.error('[xls] template load failed', {
      ...info,
      exceljsError: err?.message || String(err),
      exceljsStack: err?.stack || null,
      xlsxPopulate: alternateParser,
    });
    throw new Error(`La base seleccionada no es un XLSX compatible: ${filename}`);
  }

  if (!workbook.worksheets[0]) {
    throw new Error(`La base seleccionada no tiene hojas: ${filename}`);
  }
  return workbook;
}
