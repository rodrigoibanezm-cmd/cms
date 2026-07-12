import { cellText, findCellByLabel, norm, setVisibleCell, writableCell } from './cell_utils.js';

const CONTENT_PRIORITY = [
  ['OBSERVACION', 'OBSERVACIONES'],
  ['DETALLE', 'COMENTARIO', 'COMENTARIOS'],
  ['DESCRIPCION'],
];

function mergedWidth(sheet, row, col) {
  const cell = writableCell(sheet.getCell(row, col));
  const master = cell.address;
  let width = 0;
  for (let index = 1; index <= sheet.columnCount; index++) {
    const candidate = sheet.getCell(row, index);
    const owner = candidate.isMerged ? candidate.master?.address : candidate.address;
    if (owner === master) width += Number(sheet.getColumn(index).width) || 1;
  }
  return width || Number(sheet.getColumn(col).width) || 1;
}

function findHeader(sheet, section, labels) {
  for (let row = section.row + 1; row <= section.row + 2; row++) {
    for (let col = 1; col <= sheet.columnCount; col++) {
      if (labels.includes(norm(cellText(sheet.getCell(row, col))))) return { row, col };
    }
  }
  return null;
}

function contentHeaderNear(sheet, section) {
  for (const labels of CONTENT_PRIORITY) {
    const found = findHeader(sheet, section, labels);
    if (found) return found;
  }
  return null;
}

function widestWritableCell(sheet, row) {
  let best = null;
  const seen = new Set();
  for (let col = 1; col <= sheet.columnCount; col++) {
    const cell = writableCell(sheet.getCell(row, col));
    if (seen.has(cell.address)) continue;
    seen.add(cell.address);
    const width = mergedWidth(sheet, row, col);
    if (!best || width > best.width) best = { cell, width };
  }
  return best?.cell || null;
}

export function setSectionContent(sheet, labels, value) {
  if (!String(value || '').trim()) return false;
  const section = findCellByLabel(sheet, labels, { exactOnly: true });
  if (!section) return false;

  const header = contentHeaderNear(sheet, section);
  const target = header
    ? writableCell(sheet.getCell(header.row + 1, header.col))
    : widestWritableCell(sheet, section.row + 1);
  if (!target) return false;

  setVisibleCell(target, value, { vertical: 'top', horizontal: 'left' });
  return true;
}
