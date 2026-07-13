import {
  findCellByLabel,
  norm,
  setBesideLabel,
  setVisibleCell,
  text,
  writableCellToRight,
} from './cell_utils.js';
import { clearCellsBelowLabels, markCellBelowLabel } from './template_layout.js';

const OPTION_LABELS = {
  CLICK: ['CLICK'],
  RELOJ: ['RELOJ'],
  DIGITAL: ['DIGITAL'],
  TORQUE: ['TORQUE'],
  IMPACTO: ['IMPACTO'],
  NEUMATICA: ['NEUMÁTICA', 'NEUMATICA'],
  ELECTRICA: ['ELÉCTRICA', 'ELECTRICA'],
  INALAMBRICA: ['INALÁMBRICA', 'INALAMBRICA'],
};

const OPTION_GROUPS = [
  ['CLICK', 'RELOJ', 'DIGITAL'],
  ['TORQUE', 'IMPACTO'],
  ['NEUMATICA', 'ELECTRICA', 'INALAMBRICA'],
];

function labelsFor(value) {
  return OPTION_LABELS[norm(value)] || [value];
}

function specificValue(data, keys) {
  for (const key of keys) {
    const value = data.especificos?.[key] ?? data[key];
    if (text(value)) return value;
  }
  return null;
}

function markOption(sheet, value) {
  if (!text(value)) return;
  const key = norm(value);
  const group = OPTION_GROUPS.find((items) => items.includes(key));
  if (group) clearCellsBelowLabels(sheet, group.map(labelsFor), { maxRow: 20, exactOnly: true });
  markCellBelowLabel(sheet, labelsFor(value), 'X', { maxRow: 20, exactOnly: true });
}

function fillQuadrante(sheet, data) {
  setBesideLabel(sheet, ['CUADRANTE'], specificValue(data, ['cuadrante']), {
    maxRow: 14,
    exactOnly: true,
  });
}

function fillPrecisionValue(sheet, labels, value) {
  if (!text(value)) return;
  const found = findCellByLabel(sheet, labels, { maxRow: 16, exactOnly: true });
  if (!found) return;
  const right = writableCellToRight(sheet, found.row, found.col);
  setVisibleCell(right, value);
}

export function fillSpecificFields(sheet, data) {
  fillQuadrante(sheet, data);
  markOption(sheet, specificValue(data, ['tipo_torque']));
  markOption(sheet, specificValue(data, ['tipo_llave', 'tipo']));
  markOption(sheet, specificValue(data, ['accionamiento', 'tipo_accionamiento']));
  fillPrecisionValue(sheet, ['CW'], specificValue(data, ['precision_cw', 'presicion_cw', 'cw']));
  fillPrecisionValue(sheet, ['CCW'], specificValue(data, ['precision_ccw', 'presicion_ccw', 'ccw']));
}
