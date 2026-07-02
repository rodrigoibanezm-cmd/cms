import {
  clearCell,
  findCellByLabel,
  markCell,
  setBelowLabel,
  setCell,
  setVisibleCell,
  text,
} from './cell_utils.js';
import { fillOperativo, toolStatus } from './status_fill.js';

const VISUAL_LABELS = ['INSPECCIÓN VISUAL', 'INSPECCION VISUAL'];
const GENERIC_VISUAL_LABELS = ['INSPECCIÓN DE HERRAMIENTA', 'INSPECCION DE HERRAMIENTA'];

function setVisualInspection(sheet, value) {
  const exact = findCellByLabel(sheet, VISUAL_LABELS, { exactOnly: true });
  if (exact) {
    setBelowLabel(sheet, VISUAL_LABELS, value);
    return true;
  }

  const generic = findCellByLabel(sheet, GENERIC_VISUAL_LABELS, { exactOnly: true });
  if (!generic || !value) return false;
  setVisibleCell(sheet.getCell(generic.row + 1, generic.col), value, {
    vertical: 'top',
    horizontal: 'center',
  });
  return true;
}

function appendHeader(sheet, row, label) {
  const cell = sheet.getCell(row, 1);
  cell.value = label;
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF222222' } };
  cell.alignment = { horizontal: 'center' };
  sheet.mergeCells(row, 1, row, 10);
}

function appendSection(sheet, cursor, label, value) {
  if (!text(value)) return cursor;
  appendHeader(sheet, cursor, label);
  setVisibleCell(sheet.getCell(cursor + 1, 1), value, { vertical: 'top', horizontal: 'left' });
  sheet.mergeCells(cursor + 1, 1, cursor + 2, 10);
  return cursor + 4;
}

function appendPrueba(sheet, cursor, data) {
  if (!text(data.prueba_funcionamiento) && !toolStatus(data)) return cursor;
  appendHeader(sheet, cursor, 'PRUEBA DE FUNCIONAMIENTO');
  sheet.getCell(cursor + 1, 1).value = 'Operativo';
  sheet.getCell(cursor + 1, 2).value = 'No Operativo';
  const status = toolStatus(data);
  if (status === 'OPERATIVO') sheet.getCell(cursor + 2, 1).value = 'X';
  if (status === 'NO_OPERATIVO') sheet.getCell(cursor + 2, 2).value = 'X';
  setVisibleCell(sheet.getCell(cursor + 2, 3), data.prueba_funcionamiento, {
    vertical: 'top',
    horizontal: 'left',
  });
  sheet.mergeCells(cursor + 2, 3, cursor + 3, 10);
  return cursor + 5;
}

function ensureTextSections(sheet, data) {
  let row = sheet.rowCount + 2;
  if (!findCellByLabel(sheet, VISUAL_LABELS, { exactOnly: true })) {
    row = appendSection(sheet, row, 'INSPECCIÓN VISUAL', data.inspeccion_visual);
  }
  if (!findCellByLabel(sheet, ['PRUEBA DE FUNCIONAMIENTO'], { exactOnly: true })) {
    row = appendPrueba(sheet, row, data);
  }
  if (!findCellByLabel(sheet, ['DESARME'], { exactOnly: true })) {
    row = appendSection(sheet, row, 'DESARME', data.desarme);
  }
  if (!findCellByLabel(sheet, ['PROCEDIMIENTO'], { exactOnly: true })) {
    appendSection(sheet, row, 'PROCEDIMIENTO', data.procedimiento);
  }
}

export function fillTextByMap(sheet, data, map) {
  if (!map?.text) return false;
  Object.entries(map.text).forEach(([field, address]) => setCell(sheet, address, data[field]));
  if (map.status?.operativo) clearCell(sheet, map.status.operativo);
  if (map.status?.no_operativo) clearCell(sheet, map.status.no_operativo);
  const status = toolStatus(data);
  if (status === 'OPERATIVO') markCell(sheet, map.status.operativo);
  if (status === 'NO_OPERATIVO') markCell(sheet, map.status.no_operativo);
  ensureTextSections(sheet, data);
  return true;
}

export function fillTextSections(sheet, data) {
  setVisualInspection(sheet, data.inspeccion_visual);
  fillOperativo(sheet, data);
  setBelowLabel(sheet, ['DESARME'], data.desarme);
  setBelowLabel(sheet, ['PROCEDIMIENTO'], data.procedimiento);
  ensureTextSections(sheet, data);
}
