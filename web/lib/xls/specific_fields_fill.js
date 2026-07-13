import {
  findCellByLabel,
  setBesideLabel,
  setVisibleCell,
  text,
  writableCellToRight,
} from './cell_utils.js';
import { fillLabeledOption } from './option_field_fill.js';

const LABELS = {
  CLICK: ['CLICK'],
  RELOJ: ['RELOJ'],
  DIGITAL: ['DIGITAL'],
  TORQUE: ['TORQUE'],
  IMPACTO: ['IMPACTO'],
  NEUMATICA: ['NEUMÁTICA', 'NEUMATICA'],
  ELECTRICA: ['ELÉCTRICA', 'ELECTRICA'],
  INALAMBRICA: ['INALÁMBRICA', 'INALAMBRICA'],
};

const ALIASES = {
  ELECTRICO: 'ELECTRICA',
  ELECTRICA: 'ELECTRICA',
  NEUMATICO: 'NEUMATICA',
  NEUMATICA: 'NEUMATICA',
  INALAMBRICO: 'INALAMBRICA',
  INALAMBRICA: 'INALAMBRICA',
};

function specificValue(data, keys) {
  for (const key of keys) {
    const value = data.especificos?.[key] ?? data[key];
    if (text(value)) return value;
  }
  return null;
}

function fillOption(sheet, value, group, anchors) {
  fillLabeledOption(sheet, value, {
    aliases: ALIASES,
    labels: LABELS,
    group,
    fallbackAnchors: anchors,
    maxRow: 20,
  });
}

function fillPrecisionValue(sheet, labels, value) {
  if (!text(value)) return;
  const found = findCellByLabel(sheet, labels, { maxRow: 16, exactOnly: true });
  if (!found) return;
  setVisibleCell(writableCellToRight(sheet, found.row, found.col), value);
}

export function fillSpecificFields(sheet, data) {
  setBesideLabel(sheet, ['CUADRANTE'], specificValue(data, ['cuadrante']), { maxRow: 14, exactOnly: true });
  fillOption(sheet, specificValue(data, ['tipo_torque']), ['CLICK', 'RELOJ', 'DIGITAL'], ['TIPO TORQUE']);
  fillOption(sheet, specificValue(data, ['tipo_llave', 'tipo', 'tipo_herramienta', 'tipo_bomba']), ['TORQUE', 'IMPACTO'], ['BOMBA HIDRÁULICA', 'BOMBA HIDRAULICA', 'TIPO']);
  fillOption(sheet, specificValue(data, ['accionamiento', 'tipo_accionamiento']), ['NEUMATICA', 'ELECTRICA', 'INALAMBRICA'], ['ACCIONAMIENTO']);
  fillPrecisionValue(sheet, ['CW'], specificValue(data, ['precision_cw', 'presicion_cw', 'cw']));
  fillPrecisionValue(sheet, ['CCW'], specificValue(data, ['precision_ccw', 'presicion_ccw', 'ccw']));
}
