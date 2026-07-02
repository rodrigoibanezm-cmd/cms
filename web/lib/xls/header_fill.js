import { cellText, norm, setBesideLabel, setCell, setVisibleCell, text } from './cell_utils.js';

function fillTechnician(sheet, value) {
  if (!text(value)) return;

  for (let rowNumber = 1; rowNumber <= 14; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    let nameLabelCol = null;
    let roleLabelCol = null;

    row.eachCell((cell, colNumber) => {
      const label = norm(cellText(cell));
      if (label.includes('MECANICO')) nameLabelCol = colNumber;
      if (label.includes('ESPECIALISTA')) roleLabelCol = colNumber;
    });

    if (!nameLabelCol) continue;
    const labelEndCol = roleLabelCol || nameLabelCol;
    for (let col = labelEndCol + 1; col <= labelEndCol + 8; col++) {
      const candidate = sheet.getCell(rowNumber, col);
      if (candidate.isMerged && candidate.master?.address !== candidate.address) continue;
      if (!text(cellText(candidate))) {
        setVisibleCell(candidate, value);
        return;
      }
    }
  }

  setBesideLabel(sheet, ['MECÁNICO ESPECIALISTA', 'MECANICO ESPECIALISTA'], value, { maxRow: 14 });
}

export function fillHeaderByMap(sheet, data, map) {
  if (!map?.header) return false;
  Object.entries(map.header).forEach(([field, address]) => setCell(sheet, address, data[field]));
  return true;
}

export function fillHeader(sheet, data) {
  const top = { maxRow: 14 };
  setBesideLabel(sheet, ['OT', 'O.T', 'ORDEN DE TRABAJO'], data.ot, top);
  fillTechnician(sheet, data.tecnico);
  setBesideLabel(sheet, ['CLIENTE'], data.cliente, top);
  setBesideLabel(sheet, ['AREA USUARIA', 'ÁREA USUARIA'], data.area_usuaria, top);
  setBesideLabel(sheet, ['ROTULO', 'RÓTULO'], data.rotulo, top);
  setBesideLabel(sheet, ['FECHA EVALUACION', 'FECHA DE EVALUACION'], data.fecha_evaluacion, top);
  setBesideLabel(sheet, ['MARCA'], data.marca, top);
  setBesideLabel(sheet, ['MODELO'], data.modelo, top);
  setBesideLabel(sheet, ['SERIE'], data.serie, top);
  setBesideLabel(sheet, ['CAPACIDAD'], data.capacidad, top);
}
