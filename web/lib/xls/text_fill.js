import {
  clearCell,
  markCell,
  setCell,
} from './cell_utils.js';
import { setSectionContent } from './section_content.js';
import { fillOperativo, toolStatus } from './status_fill.js';

const SPECIFIC_VISUAL_LABELS = [
  'INSPECCIÓN VISUAL',
  'INSPECCION VISUAL',
];
const GENERIC_VISUAL_LABELS = [
  'INSPECCIÓN DE HERRAMIENTA',
  'INSPECCION DE HERRAMIENTA',
];

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

function fillVisualInspection(sheet, value) {
  const filled = setSectionContent(sheet, SPECIFIC_VISUAL_LABELS, value);
  if (!filled) setSectionContent(sheet, GENERIC_VISUAL_LABELS, value);
}

export function fillTextSections(sheet, data) {
  fillVisualInspection(sheet, data.inspeccion_visual);
  fillOperativo(sheet, data);
  setSectionContent(sheet, ['DESARME'], data.desarme);
  setSectionContent(sheet, ['PROCEDIMIENTO'], data.procedimiento);
}
