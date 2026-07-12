const VALID_RESULTS = new Set(['CUMPLE', 'NO CUMPLE', 'NO APLICA']);

function normalizeResult(value) {
  const clean = String(value || '').trim().toUpperCase().replace(/_/g, ' ');
  return VALID_RESULTS.has(clean) ? clean : null;
}

export function inspectionFromIndexedRows(rows, checklist) {
  const source = Array.isArray(rows) ? rows : [];
  const official = Array.isArray(checklist) ? checklist : [];

  return official.map((item, index) => {
    const row = source.find((entry) => Number(entry?.row_index) === index + 1) || source[index] || {};
    return {
      item,
      resultado: normalizeResult(row.resultado),
      observacion: row.observacion || null,
    };
  }).filter((row) => row.resultado || row.observacion);
}
