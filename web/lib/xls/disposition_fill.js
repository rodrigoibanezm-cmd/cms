import { cellText, norm, writableCell } from './cell_utils.js';

const IGNORED = ['ESTADO DE HERRAMIENTA', 'INFORME TECNICO'];

function statusText(data) {
  return norm(`${data.estado_herramienta || ''} ${data.estado_final || ''}`);
}

function tokenScore(status, label) {
  if (!status || !label || IGNORED.includes(label)) return 0;
  if (status === label) return 100;
  if (status.includes(label) || label.includes(status)) return 80;
  const wanted = new Set(status.split(' ').filter((word) => word.length > 2));
  const words = label.split(' ').filter((word) => word.length > 2);
  if (!wanted.size || !words.length) return 0;
  const matches = words.filter((word) => wanted.has(word)).length;
  return Math.round((matches / Math.max(wanted.size, words.length)) * 70);
}

function findBestOption(sheet, status) {
  let best = null;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 20) return;
    row.eachCell((cell, colNumber) => {
      const label = norm(cellText(cell));
      const score = tokenScore(status, label);
      if (score >= 60 && (!best || score > best.score)) {
        best = { row: rowNumber, col: colNumber, score };
      }
    });
  });
  return best;
}

function clearNearbyMarks(sheet, option) {
  const row = option.row + 1;
  const minCol = Math.max(1, option.col - 6);
  const maxCol = Math.min(sheet.columnCount, option.col + 6);
  for (let col = minCol; col <= maxCol; col++) {
    const cell = writableCell(sheet.getCell(row, col));
    const value = norm(cell.value);
    if (value === 'X' || value === '/') cell.value = null;
  }
}

export function fillDynamicDisposition(sheet, data) {
  const status = statusText(data);
  if (!status) return false;
  const option = findBestOption(sheet, status);
  if (!option) return false;
  clearNearbyMarks(sheet, option);
  writableCell(sheet.getCell(option.row + 1, option.col)).value = 'X';
  return true;
}
