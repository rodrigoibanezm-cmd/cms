import { cellText, setVisibleCell, text, writableCell } from './cell_utils.js';
import { itemKey, normalizeItem, sameInspectionItem } from './inspection_match.js';

function textScore(value) {
  const normalized = itemKey(value);
  if (!normalized || normalized.length < 3) return 0;
  if (['X', 'CUMPLE', 'NOCUMPLE', 'NOAPLICA'].includes(normalized)) return 0;
  return normalized.length;
}

function inferItemColumn(sheet, headerRow, firstResultCol) {
  const scores = new Map();
  const minCol = Math.max(1, firstResultCol - 8);
  const maxRow = Math.min(sheet.rowCount, headerRow + 30);
  for (let row = headerRow + 1; row <= maxRow; row++) {
    for (let col = minCol; col < firstResultCol; col++) {
      const score = textScore(cellText(sheet.getCell(row, col)));
      if (score) scores.set(col, (scores.get(col) || 0) + score);
    }
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function completeHeader(sheet, found) {
  const firstResultCol = found.cumple || found.obs;
  if (!found.item && firstResultCol) found.item = inferItemColumn(sheet, found.row, firstResultCol);
  if (found.item && found.obs && !found.cumple) return found;
  return found.item && found.cumple && found.noCumple && found.noAplica ? found : null;
}

function findHeaderColumns(sheet) {
  let cols = null;
  sheet.eachRow((row, rowNumber) => {
    if (cols) return;
    const found = { row: rowNumber };
    row.eachCell((cell, colNumber) => {
      const value = itemKey(cellText(cell));
      if (!found.item && value.includes('DESCRIP')) found.item = colNumber;
      if (!found.cumple && value === 'CUMPLE') found.cumple = colNumber;
      if (!found.noCumple && value.includes('NOCUMPLE')) found.noCumple = colNumber;
      if (!found.noAplica && value.includes('NOAPLICA')) found.noAplica = colNumber;
      if (!found.obs && value.includes('OBSERV')) found.obs = colNumber;
      if (!found.reparacion && value.includes('REPAR')) found.reparacion = colNumber;
    });
    cols = completeHeader(sheet, found);
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

function templateHasFixedRows(sheet, cols) {
  for (let row = cols.row + 1; row <= Math.min(sheet.rowCount, cols.row + 40); row++) {
    if (textScore(cellText(sheet.getCell(row, cols.item)))) return true;
  }
  return false;
}

function findNextEmptyInspectionRow(sheet, cols, startRow) {
  for (let row = startRow; row <= sheet.rowCount + 20; row++) {
    if (!text(cellText(sheet.getCell(row, cols.item)))) return row;
  }
  return null;
}

function resultColumn(cols, resultado) {
  if (resultado === 'CUMPLE') return cols.cumple;
  if (resultado === 'NO CUMPLE' || resultado === 'NO_CUMPLE') return cols.noCumple;
  if (resultado === 'NO APLICA' || resultado === 'NO_APLICA') return cols.noAplica;
  return cols.noAplica;
}

function narrativeValue(item) {
  if (text(item.observacion)) return item.observacion;
  return item.resultado ? item.resultado.replace(/_/g, ' ').toLowerCase() : '';
}

function fillRow(sheet, row, cols, item) {
  if (!item.item) return;
  if (!cols.cumple) {
    if (cols.obs) setVisibleCell(sheet.getCell(row, cols.obs), narrativeValue(item));
    return;
  }
  if (!item.resultado) return;
  [cols.cumple, cols.noCumple, cols.noAplica].forEach((col) => {
    writableCell(sheet.getCell(row, col)).value = null;
  });
  writableCell(sheet.getCell(row, resultColumn(cols, item.resultado))).value = 'X';
  if (cols.obs && text(item.observacion)) setVisibleCell(sheet.getCell(row, cols.obs), item.observacion);
  if (cols.reparacion && text(item.reparacion)) setVisibleCell(sheet.getCell(row, cols.reparacion), item.reparacion);
}

export function fillInspection(sheet, inspeccion = []) {
  const cols = findHeaderColumns(sheet);
  if (!cols) return;
  const fixedRows = templateHasFixedRows(sheet, cols);
  let fallbackRow = cols.row + 1;
  for (const rawItem of inspeccion) {
    const item = normalizeItem(rawItem);
    let targetRow = findInspectionRow(sheet, cols, item);
    if (!targetRow && fixedRows) continue;
    if (!targetRow) {
      targetRow = findNextEmptyInspectionRow(sheet, cols, fallbackRow);
      if (!targetRow) continue;
      setVisibleCell(sheet.getCell(targetRow, cols.item), item.item);
    }
    fallbackRow = Math.max(fallbackRow, targetRow + 1);
    fillRow(sheet, targetRow, cols, item);
  }
}
