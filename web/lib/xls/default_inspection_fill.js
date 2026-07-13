import { cellText, setVisibleCell, text } from './cell_utils.js';
import { itemKey, normalizeItem } from './inspection_match.js';

function findDefaultColumns(sheet) {
  let found = null;
  sheet.eachRow((row, rowNumber) => {
    if (found) return;
    const cols = {};
    row.eachCell((cell, colNumber) => {
      const value = itemKey(cellText(cell));
      if (!cols.item && value.includes('DESCRIP')) cols.item = colNumber;
      if (!cols.obs && value.includes('OBSERV')) cols.obs = colNumber;
      if (!cols.cumple && value === 'CUMPLE') cols.cumple = colNumber;
      if (!cols.noCumple && value.includes('NOCUMPLE')) cols.noCumple = colNumber;
      if (!cols.noAplica && value.includes('NOAPLICA')) cols.noAplica = colNumber;
    });
    const hasResults = cols.cumple || cols.noCumple || cols.noAplica;
    if (cols.item && cols.obs && !hasResults) {
      found = { row: rowNumber, item: cols.item, obs: cols.obs };
    }
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
