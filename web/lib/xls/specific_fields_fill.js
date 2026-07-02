import { cellText, findCellByLabel, norm, setBesideLabel, text, writableCell } from './cell_utils.js';

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
  const value = data.especificos?.cuadrante || data.cuadrante;
  setBesideLabel(sheet, ['CUADRANTE'], value, { maxRow: 14, exactOnly: true });
}

function fillTipoTorque(sheet, data) {
  const value = data.especificos?.tipo_torque || data.tipo_torque;
  markOptionNearLabel(sheet, value);
}

function fillTipoLlave(sheet, data) {
  const value = data.especificos?.tipo_llave
    || data.especificos?.tipo
    || data.tipo_llave
    || data.tipo;
  markOptionNearLabel(sheet, value);
}

function fillAccionamiento(sheet, data) {
  const value = data.especificos?.accionamiento
    || data.especificos?.tipo_accionamiento
    || data.accionamiento;
  markOptionNearLabel(sheet, value);
}

export function fillSpecificFields(sheet, data) {
  fillQuadrante(sheet, data);
  fillTipoTorque(sheet, data);
  fillTipoLlave(sheet, data);
  fillAccionamiento(sheet, data);
}
