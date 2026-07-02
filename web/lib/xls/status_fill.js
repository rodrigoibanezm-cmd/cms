import { cellText, clearCell, markCell, norm, setVisibleCell, text } from './cell_utils.js';

export function toolStatus(data) {
  const value = norm(`${data.prueba_funcionamiento || ''} ${data.estado_operativo || ''}`);
  if (!value) return null;
  const bad = ['NO OPERATIVO', 'NO CUMPLE', 'FUGA', 'FALLA', 'MALO', 'MALA', 'DAÑO', 'DANO', 'DOBLADO', 'ROTO', 'ROTA', 'NO FUNCIONA'];
  if (bad.some((word) => value.includes(word))) return 'NO_OPERATIVO';
  if (value.includes('CUMPLE') || value.includes('OPERATIVO')) return 'OPERATIVO';
  return null;
}

function findOperativoLabel(sheet) {
  let found = null;
  sheet.eachRow((row, rowNumber) => {
    if (found) return;
    row.eachCell((cell, colNumber) => {
      if (!found && norm(cellText(cell)) === 'OPERATIVO') found = { row: rowNumber, col: colNumber };
    });
  });
  return found;
}

function writableMarkRow(sheet, found) {
  const sameRowNext = norm(cellText(sheet.getCell(found.row, found.col + 1)));
  if (sameRowNext === 'NO OPERATIVO') return found.row + 1;
  return found.row;
}

export function fillOperativo(sheet, data) {
  const found = findOperativoLabel(sheet);
  if (!found) return;

  const status = toolStatus(data);
  const markRow = writableMarkRow(sheet, found);
  clearCell(sheet, sheet.getCell(markRow, found.col).address);
  clearCell(sheet, sheet.getCell(markRow, found.col + 1).address);
  if (status) {
    const col = status === 'NO_OPERATIVO' ? found.col + 1 : found.col;
    markCell(sheet, sheet.getCell(markRow, col).address);
  }

  if (text(data.prueba_funcionamiento)) {
    setVisibleCell(sheet.getCell(found.row, found.col + 2), data.prueba_funcionamiento, {
      vertical: 'top',
      horizontal: 'left',
    });
  }
}

export function dispositionFrom(data) {
  const structured = norm(`${data.estado_herramienta || ''} ${data.estado_final || ''}`);
  if (structured.includes('BAJA')) return 'DE BAJA';
  if (structured.includes('REPAR')) return 'REPARACION';
  if (structured.includes('MANT') || structured.includes('M.P') || structured.includes('CALIB')) return 'MANTENCION';

  const fallback = norm(data.procedimiento || '');
  if (fallback.includes('BAJA')) return 'DE BAJA';
  if (fallback.includes('REPAR')) return 'REPARACION';
  if (fallback.includes('MANT') || fallback.includes('M.P') || fallback.includes('CALIB')) return 'MANTENCION';
  return null;
}

export function fillDispositionByMap(sheet, data, map) {
  const target = dispositionFrom(data);
  if (!target || !map?.status) return false;
  clearCell(sheet, map.status.reparacion);
  clearCell(sheet, map.status.mantencion);
  clearCell(sheet, map.status.de_baja);
  if (target === 'REPARACION') markCell(sheet, map.status.reparacion);
  if (target === 'MANTENCION') markCell(sheet, map.status.mantencion);
  if (target === 'DE BAJA') markCell(sheet, map.status.de_baja);
  return true;
}

export function fillDisposition(sheet, data) {
  const target = dispositionFrom(data);
  if (!target) return;

  let found = null;
  sheet.eachRow((row, rowNumber) => {
    if (found) return;
    const cols = {};
    row.eachCell((cell, colNumber) => {
      const value = norm(cellText(cell));
      if (value.includes('REPARACION')) cols.REPARACION = colNumber;
      if (value.includes('MANTENCION')) cols.MANTENCION = colNumber;
      if (value.includes('DE BAJA')) cols['DE BAJA'] = colNumber;
    });
    if (cols.REPARACION || cols.MANTENCION || cols['DE BAJA']) {
      found = { row: rowNumber, cols };
    }
  });

  if (!found || !found.cols[target]) return;
  ['REPARACION', 'MANTENCION', 'DE BAJA'].forEach((key) => {
    if (found.cols[key]) sheet.getCell(found.row + 1, found.cols[key]).value = null;
  });
  sheet.getCell(found.row + 1, found.cols[target]).value = 'X';
}
