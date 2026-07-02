function text(value) {
  return String(value ?? '').trim();
}

function upper(value) {
  return text(value).toUpperCase();
}

function normalizeOt(value) {
  return text(value).replace(/\D/g, '');
}

function validOt(value) {
  return /^\d{4,6}$/.test(text(value));
}

function extractOt(filename) {
  const name = text(filename);
  const prefixed = name.match(/^(\d{4,6})\b/);
  if (prefixed) return prefixed[1];

  const labeled = upper(name).match(/\bOT\.?\s*(\d{4,6})\b/);
  return labeled?.[1] || null;
}

function extractRotulo(filename) {
  const match = upper(filename).match(/ROT\.?\s*([A-Z]{2,4}[-\s]?\d{3,6})/);
  return match?.[1]?.replace(/\s+/g, '').replace(/^([A-Z]{2,4})(\d)/, '$1-$2') || null;
}

function normalizeRotulo(value) {
  const raw = upper(value).replace(/\s+/g, '');
  const match = raw.match(/([A-Z]{2,4})[-]?([0-9OISB]{3,6})/);
  if (!match) return text(value);

  const digits = match[2]
    .replace(/O/g, '0')
    .replace(/I/g, '1')
    .replace(/S/g, '5')
    .replace(/B/g, '8');
  return `${match[1]}-${digits}`;
}

function normalizeModel(value) {
  return text(value).replace(/\bPRATA\b/gi, 'PRASA').replace(/\bPR4SA\b/gi, 'PRASA').replace(/\s+/g, ' ');
}

function normalizeOperativo(value) {
  const raw = upper(value).replace(/_/g, ' ');
  if (!raw) return null;
  if (raw.includes('NO OPERATIVO')) return 'NO_OPERATIVO';
  if (raw.includes('OPERATIVO')) return 'OPERATIVO';
  return null;
}

function setIfChanged(data, field, value, fixes) {
  if (!value || text(data[field]) === value) return;
  fixes.push({ field, from: data[field] ?? null, to: value });
  data[field] = value;
}

function addReason(fixed, reason) {
  fixed.razones = [...(Array.isArray(fixed.razones) ? fixed.razones : []), reason];
}

function capConfidence(fixed, score) {
  fixed.semaforo = 'ROJO';
  fixed.confidence_score = Math.min(Number(fixed.confidence_score) || 0, score);
}

function fixOt(fixed, trustedOt, fixes) {
  const normalized = normalizeOt(trustedOt || fixed.ot);
  setIfChanged(fixed, 'ot', normalized, fixes);
  if (validOt(fixed.ot)) return;
  fixes.push({ field: 'ot', from: fixed.ot ?? null, to: null, severity: 'critical' });
  capConfidence(fixed, 0);
  addReason(fixed, 'CRÍTICO: OT inválida; debe contener solo 4 a 6 números.');
}

function fixOperativo(fixed, fixes) {
  const status = normalizeOperativo(fixed.estado_operativo) || normalizeOperativo(fixed.prueba_funcionamiento);
  if (status) setIfChanged(fixed, 'estado_operativo', status, fixes);
  return status;
}

function forceCriticalReview(fixed, fixes) {
  fixes.push({
    field: 'estado_operativo',
    from: fixed.estado_operativo ?? null,
    to: null,
    severity: 'critical',
    reason: 'No se pudo leer la marca Operativo/No Operativo.',
  });
  capConfidence(fixed, 40);
  addReason(fixed, 'CRÍTICO: falta estado_operativo; no generar aprobación automática.');
}

function hasReadableResult(row) {
  return ['CUMPLE', 'NO CUMPLE', 'NO APLICA'].includes(upper(row?.resultado));
}

function enforceChecklistQuality(fixed, expectedChecklistLength, fixes) {
  if (!expectedChecklistLength) return;
  const rows = Array.isArray(fixed.inspeccion) ? fixed.inspeccion : [];
  const ratio = rows.filter(hasReadableResult).length / expectedChecklistLength;
  if (rows.length === expectedChecklistLength && ratio >= 0.8) return;
  fixes.push({ field: 'inspeccion', severity: 'critical', reason: 'Checklist incompleto o sin marcas suficientes.' });
  capConfidence(fixed, 60);
  addReason(fixed, 'CRÍTICO: checklist de inspección incompleto; requiere revisión administrativa.');
}

export function validateExtraction(data, { otHint, sourceName, expectedChecklistLength } = {}) {
  const fixed = { ...data };
  const fixes = [];
  const trustedOt = normalizeOt(otHint) || extractOt(sourceName);
  const fileRotulo = extractRotulo(sourceName);

  fixOt(fixed, trustedOt, fixes);
  if (fixed.rotulo) fixed.rotulo = normalizeRotulo(fixed.rotulo);
  setIfChanged(fixed, 'rotulo', fileRotulo, fixes);
  setIfChanged(fixed, 'modelo', normalizeModel(fixed.modelo), fixes);

  const status = fixOperativo(fixed, fixes);
  if (!status) forceCriticalReview(fixed, fixes);
  enforceChecklistQuality(fixed, expectedChecklistLength, fixes);

  fixed.validacion = { ok: true, source_name: sourceName || null, fixes };
  return fixed;
}
