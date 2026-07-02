import { cellText, norm, setVisibleCell, text, writableCell } from './cell_utils.js';

function looseKey(value) {
  return norm(value)
    .replace(/PRICIPAL/g, 'PRINCIPAL')
    .replace(/SISTEMADE/g, 'SISTEMA DE')
    .replace(/SISTEMAS/g, 'SISTEMA')
    .replace(/[^A-Z0-9]/g, '');
}

function sameInspectionItem(a, b) {
  const left = looseKey(a);
  const right = looseKey(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

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
    if (found.item && found.cumple && found.noCumple && found.noAplica) cols = { row: rowNumber, ...found };
  });
  return cols;
}

function findInspectionRow(sheet, cols, item) {
  let targetRow = null;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber <= cols.row || targetRow) return;
    if (sameInspectionItem(cellText(row.getCell(cols.item)), item.item)) targetRow = rowNumber;
  });
  return targetRow;
}

function findNextEmptyInspectionRow(sheet, cols, startRow) {
  for (let row = startRow; row <= sheet.rowCount + 20; row++) {
    if (!text(cellText(sheet.getCell(row, cols.item)))) return row;
  }
  return null;
}

function clearResultCells(sheet, row, cols) {
  [cols.cumple, cols.noCumple, cols.noAplica].forEach((col) => {
    writableCell(sheet.getCell(row, col)).value = null;
  });
}

function resultColumn(cols, resultado) {
  if (resultado === 'CUMPLE') return cols.cumple;
  if (resultado === 'NO CUMPLE') return cols.noCumple;
  return cols.noAplica;
}

function fillRow(sheet, row, cols, item) {
  clearResultCells(sheet, row, cols);
  writableCell(sheet.getCell(row, resultColumn(cols, item.resultado))).value = 'X';
  if (cols.obs && text(item.observacion)) setVisibleCell(sheet.getCell(row, cols.obs), item.observacion);
  if (cols.reparacion && text(item.reparacion)) setVisibleCell(sheet.getCell(row, cols.reparacion), item.reparacion);
}

export function fillInspection(sheet, inspeccion = []) {
  const cols = findHeaderColumns(sheet);
  if (!cols) return;

  let fallbackRow = cols.row + 1;

  for (const item of inspeccion) {
    let targetRow = findInspectionRow(sheet, cols, item);

    if (!targetRow) {
      targetRow = findNextEmptyInspectionRow(sheet, cols, fallbackRow);
      if (!targetRow) continue;
      setVisibleCell(sheet.getCell(targetRow, cols.item), item.item);
    }

    fallbackRow = Math.max(fallbackRow, targetRow + 1);
    fillRow(sheet, targetRow, cols, item);
  }
}
