import { cellText, norm, setVisibleCell, text } from './cell_utils.js';

function completeTable(cols) {
  if (cols.cantidad && !cols.descripcion) cols.descripcion = cols.cantidad + 1;
  if (cols.cantidad && cols.descripcion) return cols;
  return null;
}

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
    const found = completeTable(cols);
    if (found) table = { row: rowNumber, ...found };
  });
  return table;
}

export function fillParts(sheet, repuestos = []) {
  const parts = repuestos.filter((item) => text(item?.numero_parte) || text(item?.cantidad) || text(item?.descripcion));
  if (!parts.length) return;

  const table = findPartsTable(sheet);
  if (!table) return;

  parts.forEach((part, index) => {
    const row = table.row + 1 + index;
    if (table.numeroParte) setVisibleCell(sheet.getCell(row, table.numeroParte), text(part.numero_parte) || null);
    if (table.cantidad) setVisibleCell(sheet.getCell(row, table.cantidad), text(part.cantidad) || null);
    if (table.descripcion) {
      setVisibleCell(sheet.getCell(row, table.descripcion), text(part.descripcion) || null, { vertical: 'top' });
    }
  });
}
