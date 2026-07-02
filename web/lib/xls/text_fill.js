import {
  clearCell,
  findCellByLabel,
  markCell,
  setBelowLabel,
  setCell,
  setVisibleCell,
} from './cell_utils.js';
import { fillOperativo, toolStatus } from './status_fill.js';

const VISUAL_LABELS = ['INSPECCIÓN VISUAL', 'INSPECCION VISUAL'];
const GENERIC_VISUAL_LABELS = ['INSPECCIÓN DE HERRAMIENTA', 'INSPECCION DE HERRAMIENTA'];

function setVisualInspection(sheet, value) {
  const exact = findCellByLabel(sheet, VISUAL_LABELS, { exactOnly: true });
  if (exact) {
    setBelowLabel(sheet, VISUAL_LABELS, value);
    return;
  }

  const generic = findCellByLabel(sheet, GENERIC_VISUAL_LABELS, { exactOnly: true });
  if (!generic || !value) return;
  setVisibleCell(sheet.getCell(generic.row + 1, generic.col), value, {
    vertical: 'top',
    horizontal: 'center',
  });
}

export function fillTextByMap(sheet, data, map) {
  if (!map?.text) return false;
  Object.entries(map.text).forEach(([field, address]) => setCell(sheet, address, data[field]));
  if (map.status?.operativo) clearCell(sheet, map.status.operativo);
  if (map.status?.no_operativo) clearCell(sheet, map.status.no_operativo);
  const status = toolStatus(data);
  if (status === 'OPERATIVO') markCell(sheet, map.status.operativo);
  if (status === 'NO_OPERATIVO') markCell(sheet, map.status.no_operativo);
  return true;
}

export function fillTextSections(sheet, data) {
  setVisualInspection(sheet, data.inspeccion_visual);
  fillOperativo(sheet, data);
  setBelowLabel(sheet, ['DESARME'], data.desarme);
  setBelowLabel(sheet, ['PROCEDIMIENTO'], data.procedimiento);
}
