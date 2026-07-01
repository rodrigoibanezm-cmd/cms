function text(value) {
  return String(value ?? '').trim();
}

function upper(value) {
  return text(value).toUpperCase();
}

function extractOt(filename) {
  const match = text(filename).match(/\b(\d{4,6})\b/);
  return match?.[1] || null;
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

function setIfChanged(data, field, value, fixes) {
  if (!value || text(data[field]) === value) return;
  fixes.push({ field, from: data[field] ?? null, to: value });
  data[field] = value;
}

export function validateExtraction(data, { ot, sourceName } = {}) {
  const fixed = { ...data };
  const fixes = [];
  const fileOt = extractOt(sourceName) || text(ot);
  const fileRotulo = extractRotulo(sourceName);

  setIfChanged(fixed, 'ot', fileOt, fixes);
  if (fixed.rotulo) fixed.rotulo = normalizeRotulo(fixed.rotulo);
  setIfChanged(fixed, 'rotulo', fileRotulo, fixes);

  const model = normalizeModel(fixed.modelo);
  setIfChanged(fixed, 'modelo', model, fixes);

  fixed.validacion = {
    ok: true,
    source_name: sourceName || null,
    fixes,
  };

  return fixed;
}
