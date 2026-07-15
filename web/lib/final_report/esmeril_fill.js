import { norm, writableCell } from '../xls/cell_utils.js';

const HEADER = {
  D8: 'marca', D9: 'modelo', D10: 'serie',
  I8: 'cliente', I9: 'panol_faena', I10: 'rotulo', I11: 'ot',
  N8: 'area_usuaria', N9: 'tecnico', N10: 'fecha_evaluacion',
};
const RESULT_COLS = { CUMPLE: 5, 'NO CUMPLE': 7, NO_CUMPLE: 7, 'NO APLICA': 9, NO_APLICA: 9 };
const PHOTO_COMMENTS = [
  ['C9', 'INSPECCIÓN VISUAL', 'inspeccion_visual'],
  ['C19', 'PRUEBA DE FUNCIONAMIENTO', 'prueba_funcionamiento'],
  ['C21', 'DESARME', 'desarme'],
  ['C24', 'REPARACIÓN', 'procedimiento'],
];

function write(sheet, address, value) {
  writableCell(sheet.getCell(address)).value = value || null;
}

function inspectionRows(sheet) {
  const rows = new Map();
  for (let row = 24; row <= 39; row += 1) rows.set(norm(sheet.getCell(row, 3).value), row);
  return rows;
}

function fillInspection(sheet, items = []) {
  const rows = inspectionRows(sheet);
  for (let row = 24; row <= 39; row += 1) [5, 7, 9, 11, 13].forEach((col) => write(sheet, sheet.getCell(row, col).address, null));
  items.forEach((item) => {
    const row = rows.get(norm(item?.item));
    const col = RESULT_COLS[String(item?.resultado || '').toUpperCase()];
    if (!row || !col) return;
    write(sheet, sheet.getCell(row, col).address, 'X');
    write(sheet, `K${row}`, item.observacion);
    write(sheet, `M${row}`, item.reparacion || item['reparación']);
  });
}

export function fillEsmerilFinal(workbook, data) {
  const main = workbook.worksheets[0];
  const photos = workbook.worksheets[1];
  Object.entries(HEADER).forEach(([address, field]) => write(main, address, data[field]));
  [['E23', 'CUMPLE'], ['G23', 'NO CUMPLE'], ['I23', 'NO APLICA'], ['K23', 'OBSERVACIONES'], ['M23', 'REPARACIÓN']]
    .forEach(([address, value]) => write(main, address, value));
  fillInspection(main, data.inspeccion);
  write(main, 'C49', 'JEFE DE AREA.');
  write(main, 'K49', 'TECNICO ESPECIALIZADO.');
  PHOTO_COMMENTS.forEach(([address, title, field]) => write(photos, address, `${title}: ${data[field] || ''}`));
  write(photos, 'C34', 'JEFE DE AREA.');
  write(photos, 'K34', 'TECNICO ESPECIALIZADO.');
}
