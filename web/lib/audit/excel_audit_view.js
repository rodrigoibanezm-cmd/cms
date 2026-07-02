import ExcelJS from 'exceljs';

function cellText(cell) {
  const value = cell.value;
  if (value?.richText) return value.richText.map((r) => r.text).join('');
  if (value?.formula) return value.result ?? value.formula;
  return value ?? null;
}

export async function excelToAuditView(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  const cells = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 90) return;
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const value = cellText(cell);
      if (value === null || String(value).trim() === '') return;
      cells.push({
        address: cell.address,
        row: rowNumber,
        col: colNumber,
        value: String(value).trim(),
      });
    });
  });

  return {
    sheet: sheet.name,
    cells,
  };
}
