import { cellText, text, writableCell } from './cell_utils.js';

function hasBorder(cell) {
  const border = cell.border || {};
  return Boolean(border.top || border.bottom || border.left || border.right);
}

function isDarkFill(cell) {
  const color = cell.fill?.fgColor?.argb || '';
  return color.startsWith('FF00') || color.startsWith('FF11') || color.startsWith('FF22') || color.startsWith('FF33');
}

function shouldStyle(cell) {
  if (text(cellText(cell))) return false;
  if (isDarkFill(cell)) return false;
  return hasBorder(cell) || cell.isMerged;
}

export function styleEditableCells(sheet) {
  for (let row = 1; row <= sheet.rowCount; row++) {
    for (let col = 1; col <= sheet.columnCount; col++) {
      const cell = writableCell(sheet.getCell(row, col));
      if (!shouldStyle(cell)) continue;
      cell.font = {
        ...(cell.font || {}),
        bold: true,
        size: 26,
        color: { argb: 'FF000000' },
      };
      cell.alignment = { ...(cell.alignment || {}), wrapText: true };
    }
  }
}
