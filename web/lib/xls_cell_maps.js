// Los mapas hardcodeados quedan reservados para casos excepcionales.
// Si una plantilla no aparece aquí, el generador usa búsqueda dinámica por etiquetas.
const CELL_MAPS = {};

export function getCellMap(templateKey) {
  return CELL_MAPS[templateKey] || null;
}
