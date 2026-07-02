const CELL = /^[A-Z]+[1-9][0-9]*$/;
const COL = /^[A-Z]+$/;

function isObj(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function checkCell(errors, path, value) {
  if (value === null || value === undefined) return;
  if (typeof value !== 'string' || !CELL.test(value)) errors.push(`${path} no es celda válida: ${value}`);
}

function checkCol(errors, path, value) {
  if (value === null || value === undefined) return;
  if (typeof value !== 'string' || !COL.test(value)) errors.push(`${path} no es columna válida: ${value}`);
}

function walkCells(errors, prefix, node) {
  if (!isObj(node)) return;
  Object.entries(node).forEach(([key, value]) => {
    const path = `${prefix}.${key}`;
    if (isObj(value)) return walkCells(errors, path, value);
    checkCell(errors, path, value);
  });
}

export function validateTemplateMap(map) {
  const errors = [];
  if (!isObj(map)) return ['map no es objeto'];
  if (!map.template_key) errors.push('falta template_key');
  if (!map.sheet) errors.push('falta sheet');
  walkCells(errors, 'header', map.header);
  walkCells(errors, 'disposicion', map.disposicion);
  walkCells(errors, 'operativo', map.operativo);
  walkCells(errors, 'text_sections', map.text_sections);
  walkCells(errors, 'especificos', map.especificos);

  if (map.checklist) {
    if (map.checklist.header_row && typeof map.checklist.header_row !== 'number') errors.push('checklist.header_row debe ser número');
    ['item_col', 'cumple_col', 'no_cumple_col', 'no_aplica_col', 'observacion_col', 'reparacion_col']
      .forEach((key) => checkCol(errors, `checklist.${key}`, map.checklist[key]));
  }

  if (map.parts) {
    if (map.parts.header_row && typeof map.parts.header_row !== 'number') errors.push('parts.header_row debe ser número');
    ['numero_parte_col', 'cantidad_col', 'descripcion_col']
      .forEach((key) => checkCol(errors, `parts.${key}`, map.parts[key]));
  }

  return errors;
}
