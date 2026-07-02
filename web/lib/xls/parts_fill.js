import { cellText, norm, setVisibleCell, text } from './cell_utils.js';

function findPartsTable(sheet) {
  let table = null;
  sheet.eachRow((row, rowNumber) => {
    if (table) return;
    const cols = {};
    row.eachCell((cell, colNumber) => {
      const value = norm(cellText(cell));
      if (value.includes('PARTE')) cols.numeroParte = colNumber;
      if (value.includes('CANTIDAD')) cols.cantidad = colNumber;
      if (value.includes('REPUEST') || value.includes('ACCESOR')) cols.descripcion = colNumber;
    });
    if (cols.cantidad && cols.descripcion) table = { row: rowNumber, ...cols };
  });
  return table;
}

function createPartsTable(sheet) {
  const row = sheet.rowCount + 2;
  const header = sheet.getCell(row, 1);
  header.value = 'REPUESTOS O ACCESORIOS REQUERIDOS';
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF222222' } };
  header.alignment = { horizontal: 'center' };
  sheet.mergeCells(row, 1, row, 10);

  sheet.getCell(row + 1, 1).value = 'Nº DE PARTE';
  sheet.getCell(row + 1, 3).value = 'CANTIDAD';
  sheet.getCell(row + 1, 5).value = 'REPUESTOS O ACCESORIOS REQUERIDOS';
  return { row: row + 1, numeroParte: 1, cantidad: 3, descripcion: 5 };
}

export function fillParts(sheet, repuestos = []) {
  const parts = repuestos.filter((item) => text(item?.numero_parte) || text(item?.cantidad) || text(item?.descripcion));
  if (!parts.length) return;

  const table = findPartsTable(sheet) || createPartsTable(sheet);

  parts.forEach((part, index) => {
    const row = table.row + 1 + index;
    if (table.numeroParte) setVisibleCell(sheet.getCell(row, table.numeroParte), text(part.numero_parte) || null);
    if (table.cantidad) setVisibleCell(sheet.getCell(row, table.cantidad), text(part.cantidad) || null);
    if (table.descripcion) {
      setVisibleCell(sheet.getCell(row, table.descripcion), text(part.descripcion) || null, {
        vertical: 'top',
      });
    }
  });
}
