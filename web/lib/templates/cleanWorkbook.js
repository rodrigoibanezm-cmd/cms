const XlsxPopulate = require('xlsx-populate');

const DATA_LABELS = new Set([
  'marca', 'modelo', 'serie', 'capacidad', 'cliente', 'rotulo', 'rótulo',
  'fecha', 'ot', 'o.t', 'técnico', 'tecnico', 'area usuaria', 'área usuaria'
]);
const CHECK_VALUES = new Set(['x', '/', '✓', '✔']);
const DROP_SHEET_WORDS = ['foto', 'fotograf', 'imagen'];
const FREE_TEXT_WORDS = [
  'inspeccion visual', 'inspección visual', 'prueba de funcionamiento',
  'desarme', 'procedimiento', 'repuestos o accesorios requeridos'
];

function norm(value) {
  return String(value || '').trim().toLowerCase();
}

function isDataLabel(value) {
  return DATA_LABELS.has(norm(value));
}

function isCheck(value) {
  return CHECK_VALUES.has(norm(value));
}

function shouldDropSheet(sheet) {
  const name = norm(sheet.name());
  return DROP_SHEET_WORDS.some((word) => name.includes(word));
}

function usedRange(sheet) {
  return sheet.usedRange();
}

function rowText(sheet, rowNumber, colStart, colEnd) {
  const values = [];
  for (let col = colStart; col <= colEnd; col += 1) {
    values.push(norm(sheet.cell(rowNumber, col).value()));
  }
  return values.filter(Boolean).join(' ');
}

function pickSheet(workbook) {
  const sheets = workbook.sheets().filter((sheet) => !shouldDropSheet(sheet));
  if (!sheets.length) return workbook.sheet(0);
  return sheets.sort((a, b) => {
    const ar = usedRange(a);
    const br = usedRange(b);
    const ac = ar ? ar.cells().filter((c) => c.value()).length : 0;
    const bc = br ? br.cells().filter((c) => c.value()).length : 0;
    return bc - ac;
  })[0];
}

function keepOnlySheet(workbook, keep) {
  workbook.sheets().forEach((sheet) => {
    if (sheet.name() !== keep.name()) workbook.deleteSheet(sheet.name());
  });
  keep.name('Informe Tecnico');
}

function clearRightSideData(sheet) {
  const range = usedRange(sheet);
  if (!range) return;
  range.forEach((cell) => {
    if (!isDataLabel(cell.value())) return;
    const row = cell.rowNumber();
    const start = cell.columnNumber() + 1;
    const end = Math.min(start + 3, sheet.usedRange().endCell().columnNumber());
    for (let col = start; col <= end; col += 1) {
      const target = sheet.cell(row, col);
      if (!isDataLabel(target.value())) target.value(null);
    }
  });
}

function clearMarksAndFreeText(sheet) {
  const range = usedRange(sheet);
  if (!range) return;
  const rowStart = range.startCell().rowNumber();
  const rowEnd = range.endCell().rowNumber();
  const colStart = range.startCell().columnNumber();
  const colEnd = range.endCell().columnNumber();
  for (let r = rowStart; r <= rowEnd; r += 1) {
    const text = rowText(sheet, r, colStart, colEnd);
    if (text.includes('registro fotograf')) {
      for (let c = colStart; c <= colEnd; c += 1) sheet.cell(r, c).value(null);
      continue;
    }
    for (let c = colStart; c <= colEnd; c += 1) {
      const cell = sheet.cell(r, c);
      const value = norm(cell.value());
      if (isCheck(value)) cell.value(null);
      if (FREE_TEXT_WORDS.some((word) => value.includes(word)) && value.includes(':')) {
        cell.value(null);
      }
      if (value.includes('jefe de area') || value.includes('tecnico especializado')) {
        cell.value(null);
      }
    }
  }
}

async function cleanWorkbook(buffer) {
  const workbook = await XlsxPopulate.fromDataAsync(buffer);
  const sheet = pickSheet(workbook);
  keepOnlySheet(workbook, sheet);
  clearRightSideData(sheet);
  clearMarksAndFreeText(sheet);
  return workbook.outputAsync();
}

module.exports = { cleanWorkbook };
