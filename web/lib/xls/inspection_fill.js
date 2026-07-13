import { cellText, setVisibleCell, text, writableCell } from './cell_utils.js';
import { normalizeItem, sameInspectionItem } from './inspection_match.js';
import { inspectionLayout } from './template_layout.js';

function fallbackHeaderColumns(sheet) {
  let cols = null;
  sheet.eachRow((row, rowNumber) => {
    if (cols) return;
    const found = { row: rowNumber };
    row.eachCell((cell, colNumber) => {
      const value = String(cellText(cell) || '').toUpperCase().replace(/\s+/g, '');
      if (!found.item && value.includes('DESCRIP')) found.item = colNumber;
      if (!found.cumple && value === 'CUMPLE') found.cumple = colNumber;
      if (!found.noCumple && value.includes('NOCUMPLE')) found.noCumple = colNumber;
      if (!found.noAplica && value.includes('NOAPLICA')) found.noAplica = colNumber;
      if (!found.obs && value.includes('OBSERV')) found.obs = colNumber;
      if (!found.reparacion && value.includes('REPAR')) found.reparacion = colNumber;
    });
    if (found.item && found.obs && !found.cumple) cols = found;
    if (found.item && found.cumple && found.noCumple && found.noAplica) cols = found;
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

function fixedRows(sheet, cols) {
  const rows = [];
  for (let row = cols.row + 1; row <= Math.min(sheet.rowCount, cols.row + 40); row++) {
    if (text(cellText(sheet.getCell(row, cols.item)))) rows.push(row);
  }
  return rows;
}

function nextEmptyRow(sheet, cols, startRow) {
  for (let row = startRow; row <= sheet.rowCount + 20; row++) {
    if (!text(cellText(sheet.getCell(row, cols.item)))) return row;
  }
  return null;
}

function resultColumn(cols, result) {
  if (result === 'CUMPLE') return cols.cumple;
  if (result === 'NO CUMPLE' || result === 'NO_CUMPLE') return cols.noCumple;
  if (result === 'NO APLICA' || result === 'NO_APLICA') return cols.noAplica;
  return null;
}

function clearResults(sheet, row, cols) {
  [cols.cumple, cols.noCumple, cols.noAplica]
    .filter(Boolean)
    .forEach((col) => { writableCell(sheet.getCell(row, col)).value = null; });
}

function fillRow(sheet, row, cols, item) {
  if (!item.item) return;
  clearResults(sheet, row, cols);
  const targetCol = resultColumn(cols, item.resultado);
  if (targetCol) writableCell(sheet.getCell(row, targetCol)).value = 'X';
  if (cols.obs && text(item.observacion)) {
    setVisibleCell(writableCell(sheet.getCell(row, cols.obs)), item.observacion, {
      vertical: 'top',
      horizontal: 'left',
    });
  }
  if (cols.reparacion && text(item.reparacion)) {
    setVisibleCell(writableCell(sheet.getCell(row, cols.reparacion)), item.reparacion);
  }
}

export function fillInspection(sheet, inspeccion = []) {
  const cols = fallbackHeaderColumns(sheet) || inspectionLayout(sheet);
  if (!cols?.item) return;
  const rows = fixedRows(sheet, cols);
  let fallbackRow = cols.row + 1;
  for (const rawItem of inspeccion) {
    const item = normalizeItem(rawItem);
    let targetRow = findInspectionRow(sheet, cols, item);
    if (!targetRow && rows.length) continue;
    if (!targetRow) {
      targetRow = nextEmptyRow(sheet, cols, fallbackRow);
      if (!targetRow) continue;
      setVisibleCell(sheet.getCell(targetRow, cols.item), item.item);
    }
    fallbackRow = Math.max(fallbackRow, targetRow + 1);
    fillRow(sheet, targetRow, cols, item);
  }
}
