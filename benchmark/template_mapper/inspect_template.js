import ExcelJS from 'exceljs';

function cellText(cell) {
  const value = cell.value;
  if (value?.richText) return value.richText.map((r) => r.text).join('');
  if (value?.formula) return value.result ?? value.formula;
  return value ?? null;
}

function colLetter(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function compactStyle(cell) {
  const out = {};
  if (cell.font?.bold) out.bold = true;
  if (cell.fill?.fgColor?.argb) out.fill = cell.fill.fgColor.argb;
  if (cell.alignment?.horizontal) out.align = cell.alignment.horizontal;
  return Object.keys(out).length ? out : undefined;
}

export async function inspectTemplate(filePath, options = {}) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  const maxRows = options.maxRows || 80;
  const maxCols = options.maxCols || 20;
  const cells = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > maxRows) return;
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      if (colNumber > maxCols) return;
      const value = cellText(cell);
      if (value === null || String(value).trim() === '') return;
      cells.push({
        address: cell.address,
        row: rowNumber,
        col: colLetter(colNumber),
        value: String(value).trim(),
        style: compactStyle(cell),
      });
    });
  });

  return {
    sheet: sheet.name,
    row_count: sheet.rowCount,
    column_count: sheet.columnCount,
    merges: sheet.model.merges || [],
    cells,
  };
}
