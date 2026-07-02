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

function optionLabels(value) {
  return OPTION_LABELS[norm(value)] || [value];
}

function markOptionNearLabel(sheet, value) {
  if (!text(value)) return;
  const found = findCellByLabel(sheet, optionLabels(value), { exactOnly: true });
  if (!found) return;

  const sameCell = sheet.getCell(found.row, found.col);
  const below = sheet.getCell(found.row + 1, found.col);
  const target = text(cellText(below)) ? sameCell : below;

  writableCell(target).value = 'X';
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
  const value = data.especificos?.tipo || data.tipo;
  markOptionNearLabel(sheet, value);
}

function fillAccionamiento(sheet, data) {
  const value = data.especificos?.accionamiento || data.accionamiento;
  markOptionNearLabel(sheet, value);
}

export function fillSpecificFields(sheet, data) {
  fillQuadrante(sheet, data);
  fillTipoTorque(sheet, data);
  fillTipoLlave(sheet, data);
  fillAccionamiento(sheet, data);
}
