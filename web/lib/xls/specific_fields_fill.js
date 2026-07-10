import { cellText, findCellByLabel, norm, setBesideLabel, setVisibleCell, text, writableCell } from './cell_utils.js';

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

function optionLabels(value) {
  return OPTION_LABELS[norm(value)] || [value];
}

function specificValue(data, keys) {
  for (const key of keys) {
    const value = data.especificos?.[key] ?? data[key];
    if (text(value)) return value;
  }
  return null;
}

function markTargetForLabel(sheet, found) {
  const sameCell = sheet.getCell(found.row, found.col);
  const below = sheet.getCell(found.row + 1, found.col);
  return text(cellText(below)) ? sameCell : below;
}

function clearOptionGroup(sheet, value) {
  const key = norm(value);
  const group = OPTION_GROUPS.find((items) => items.includes(key));
  if (!group) return;

  group.forEach((option) => {
    const found = findCellByLabel(sheet, optionLabels(option), { exactOnly: true });
    if (found) writableCell(markTargetForLabel(sheet, found)).value = null;
  });
}

function markOptionNearLabel(sheet, value) {
  if (!text(value)) return;
  clearOptionGroup(sheet, value);
  const found = findCellByLabel(sheet, optionLabels(value), { exactOnly: true });
  if (!found) return;
  writableCell(markTargetForLabel(sheet, found)).value = 'X';
}

function fillQuadrante(sheet, data) {
  const value = specificValue(data, ['cuadrante']);
  setBesideLabel(sheet, ['CUADRANTE'], value, { maxRow: 14, exactOnly: true });
}

function fillTipoTorque(sheet, data) {
  markOptionNearLabel(sheet, specificValue(data, ['tipo_torque']));
}

function fillTipoLlave(sheet, data) {
  const value = specificValue(data, ['tipo_llave', 'tipo']);
  markOptionNearLabel(sheet, value);
}

function fillAccionamiento(sheet, data) {
  const value = specificValue(data, ['accionamiento', 'tipo_accionamiento']);
  markOptionNearLabel(sheet, value);
}

function fillPrecisionValue(sheet, labels, value) {
  if (!text(value)) return;
  const found = findCellByLabel(sheet, labels, { maxRow: 16, exactOnly: true });
  if (!found) return;
  setVisibleCell(sheet.getCell(found.row + 1, found.col), value);
}

function fillTorquePrecision(sheet, data) {
  const cw = specificValue(data, ['precision_cw', 'presicion_cw', 'cw']);
  const ccw = specificValue(data, ['precision_ccw', 'presicion_ccw', 'ccw']);
  fillPrecisionValue(sheet, ['CW'], cw);
  fillPrecisionValue(sheet, ['CCW'], ccw);
}

export function fillSpecificFields(sheet, data) {
  fillQuadrante(sheet, data);
  fillTipoTorque(sheet, data);
  fillTipoLlave(sheet, data);
  fillAccionamiento(sheet, data);
  fillTorquePrecision(sheet, data);
}