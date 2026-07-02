export function auditContextText({ extraction, excelView }) {
  return [
    'Contexto de extracción usado para generar el Excel:',
    JSON.stringify(extraction || {}, null, 2),
    '',
    'Contenido leído desde el Excel generado:',
    JSON.stringify(excelView || {}, null, 2),
  ].join('\n');
}
