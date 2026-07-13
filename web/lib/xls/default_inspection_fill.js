import { cellText, setVisibleCell, text } from './cell_utils.js';
import { itemKey, normalizeItem } from './inspection_match.js';

function findDefaultColumns(sheet) {
  let found = null;
  sheet.eachRow((row, rowNumber) => {
    if (found) return;
    let item = null;
    let obs = null;
    row.eachCell((cell, colNumber) => {
      const value = itemKey(cellText(cell));
      if (!item && value.includes('DESCRIP')) item = colNumber;
      if (!obs && value.includes('OBSERV')) obs = colNumber;
    });
    if (item && obs) found = { row: rowNumber, item, obs };
  });
  return found;
}

function nextEmptyRow(sheet, cols, startRow) {
  for (let row = startRow; row <= sheet.rowCount + 20; row++) {
    const item = text(cellText(sheet.getCell(row, cols.item)));
    const obs = text(cellText(sheet.getCell(row, cols.obs)));
    if (!item && !obs) return row;
  }
  return null;
}

export function fillDefaultInspection(sheet, inspection = []) {
  const cols = findDefaultColumns(sheet);
  if (!cols || !inspection.length) return false;

  let row = cols.row + 1;
  for (const raw of inspection) {
    const item = normalizeItem(raw);
    if (!item.item) continue;
    const target = nextEmptyRow(sheet, cols, row);
    if (!target) break;
    setVisibleCell(sheet.getCell(target, cols.item), item.item);
    if (text(item.observacion)) {
      setVisibleCell(sheet.getCell(target, cols.obs), item.observacion);
    }
    row = target + 1;
  }
  return true;
}
