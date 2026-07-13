import { cellText, norm, writableCell } from './cell_utils.js';

function cellLabel(cell) {
  return norm(cellText(cell));
}

function labelIndex(sheet, maxRow = sheet.rowCount) {
  const items = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > maxRow) return;
    row.eachCell((cell, colNumber) => {
      const label = cellLabel(cell);
      if (label) items.push({ label, row: rowNumber, col: colNumber });
    });
  });
  return items;
}

export function findLayoutLabel(sheet, labels, options = {}) {
  const wanted = labels.map(norm);
  const items = labelIndex(sheet, options.maxRow || sheet.rowCount);
  for (const exact of [true, false]) {
    const found = items.find((item) => wanted.some((label) => (
      exact ? item.label === label : item.label.includes(label)
    )));
    if (found) return found;
    if (options.exactOnly) break;
  }
  return null;
}

export function markCellBelowLabel(sheet, labels, value = 'X', options = {}) {
  const found = findLayoutLabel(sheet, labels, options);
  if (!found) return false;
  const target = writableCell(sheet.getCell(found.row + 1, found.col));
  target.value = value;
  return true;
}

export function clearCellsBelowLabels(sheet, groups, options = {}) {
  for (const labels of groups) {
    const found = findLayoutLabel(sheet, labels, options);
    if (found) writableCell(sheet.getCell(found.row + 1, found.col)).value = null;
  }
}

function headerValue(cell) {
  const value = cellLabel(cell);
  if (value.includes('DESCRIP')) return 'item';
  if (value === 'CUMPLE') return 'cumple';
  if (value.includes('NOCUMPLE')) return 'noCumple';
  if (value.includes('NOAPLICA')) return 'noAplica';
  if (value.includes('OBSERV')) return 'obs';
  if (value.includes('REPAR')) return 'reparacion';
  return null;
}

export function inspectionLayout(sheet) {
  let result = null;
  sheet.eachRow((row, rowNumber) => {
    if (result) return;
    const found = { row: rowNumber };
    row.eachCell((cell, colNumber) => {
      const key = headerValue(cell);
      if (key && !found[key]) found[key] = colNumber;
    });
    if (found.item && found.cumple && found.noCumple && found.noAplica) result = found;
  });
  return result;
}
