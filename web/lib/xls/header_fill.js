import { setBesideLabel, setCell } from './cell_utils.js';

export function fillHeaderByMap(sheet, data, map) {
  if (!map?.header) return false;
  Object.entries(map.header).forEach(([field, address]) => setCell(sheet, address, data[field]));
  return true;
}

export function fillHeader(sheet, data) {
  const top = { maxRow: 14 };
  setBesideLabel(sheet, ['OT', 'O.T', 'ORDEN DE TRABAJO'], data.ot, top);
  setBesideLabel(sheet, ['MECÁNICO ESPECIALISTA', 'MECANICO ESPECIALISTA'], data.tecnico, top);
  setBesideLabel(sheet, ['CLIENTE'], data.cliente, top);
  setBesideLabel(sheet, ['AREA USUARIA', 'ÁREA USUARIA'], data.area_usuaria, top);
  setBesideLabel(sheet, ['ROTULO', 'RÓTULO'], data.rotulo, top);
  setBesideLabel(sheet, ['FECHA EVALUACION', 'FECHA DE EVALUACION'], data.fecha_evaluacion, top);
  setBesideLabel(sheet, ['MARCA'], data.marca, top);
  setBesideLabel(sheet, ['MODELO'], data.modelo, top);
  setBesideLabel(sheet, ['SERIE'], data.serie, top);
  setBesideLabel(sheet, ['CAPACIDAD'], data.capacidad, top);
}
