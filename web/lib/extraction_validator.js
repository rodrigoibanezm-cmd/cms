function text(value) {
  return String(value ?? '').trim();
}

function upper(value) {
  return text(value).toUpperCase();
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
  return text(value)
    .replace(/\bPRATA\b/gi, 'PRASA')
    .replace(/\bPR4SA\b/gi, 'PRASA')
    .replace(/\s+/g, ' ')
    .trim();
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

function fixOperativo(fixed, fixes) {
  const explicit = normalizeOperativo(fixed.estado_operativo);
  const fallback = normalizeOperativo(fixed.prueba_funcionamiento);
  const status = explicit || fallback;
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
  fixed.semaforo = 'ROJO';
  fixed.confidence_score = Math.min(Number(fixed.confidence_score) || 0, 40);
  fixed.razones = [
    ...(Array.isArray(fixed.razones) ? fixed.razones : []),
    'CRÍTICO: falta estado_operativo; no generar aprobación automática.',
  ];
}

export function validateExtraction(data, { otHint, sourceName } = {}) {
  const fixed = { ...data };
  const fixes = [];
  const fileOt = extractOt(sourceName);
  const trustedOt = text(otHint) || fileOt;
  const fileRotulo = extractRotulo(sourceName);

  setIfChanged(fixed, 'ot', trustedOt, fixes);
  if (fixed.rotulo) fixed.rotulo = normalizeRotulo(fixed.rotulo);
  setIfChanged(fixed, 'rotulo', fileRotulo, fixes);

  const model = normalizeModel(fixed.modelo);
  setIfChanged(fixed, 'modelo', model, fixes);

  const status = fixOperativo(fixed, fixes);
  if (!status) forceCriticalReview(fixed, fixes);

  fixed.validacion = {
    ok: true,
    source_name: sourceName || null,
    fixes,
  };

  return fixed;
}
