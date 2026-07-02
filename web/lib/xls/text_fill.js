import { clearCell, markCell, setBelowLabel, setCell } from './cell_utils.js';
import { fillOperativo, toolStatus } from './status_fill.js';

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
  setBelowLabel(sheet, ['INSPECCIÓN VISUAL', 'INSPECCION VISUAL'], data.inspeccion_visual);
  fillOperativo(sheet, data);
  setBelowLabel(sheet, ['DESARME'], data.desarme);
  setBelowLabel(sheet, ['PROCEDIMIENTO'], data.procedimiento);
}
