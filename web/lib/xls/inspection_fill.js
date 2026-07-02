import { cellText, norm, setVisibleCell, text } from './cell_utils.js';

function findHeaderColumns(sheet) {
  let cols = null;
  sheet.eachRow((row, rowNumber) => {
    if (cols) return;
    const found = {};
    row.eachCell((cell, colNumber) => {
      const value = norm(cellText(cell));
      if (!found.item && value.includes('DESCRIP')) found.item = colNumber;
      if (!found.cumple && value === 'CUMPLE') found.cumple = colNumber;
      if (!found.noCumple && value.includes('NO CUMPLE')) found.noCumple = colNumber;
      if (!found.noAplica && value.includes('NO APLICA')) found.noAplica = colNumber;
      if (!found.obs && value.includes('OBSERV')) found.obs = colNumber;
      if (!found.reparacion && value.includes('REPAR')) found.reparacion = colNumber;
    });
    if (found.item && found.cumple && found.noCumple && found.noAplica) {
      cols = { row: rowNumber, ...found };
    }
  });
  return cols;
}

export function fillInspection(sheet, inspeccion = []) {
  const cols = findHeaderColumns(sheet);
  if (!cols) return;

  for (const item of inspeccion) {
    let targetRow = null;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= cols.row || targetRow) return;
      const label = norm(cellText(row.getCell(cols.item)));
      if (label && label === norm(item.item)) targetRow = rowNumber;
    });
    if (!targetRow) continue;

    const markCol = item.resultado === 'CUMPLE'
      ? cols.cumple
      : item.resultado === 'NO CUMPLE'
        ? cols.noCumple
        : cols.noAplica;

    sheet.getCell(targetRow, markCol).value = 'X';
    if (cols.obs && text(item.observacion)) setVisibleCell(sheet.getCell(targetRow, cols.obs), item.observacion);
    if (cols.reparacion && text(item.reparacion)) setVisibleCell(sheet.getCell(targetRow, cols.reparacion), item.reparacion);
  }
}
