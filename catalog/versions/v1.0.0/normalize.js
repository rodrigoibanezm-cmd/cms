function stripExtension(value) {
  return String(value || '').replace(/\.[^.]+$/, '')
}

function normalize(value) {
  return stripExtension(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\bOT[\s_-]*\d+\b/g, ' ')
    .replace(/\b\d{4,}\b/g, ' ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function familyKey(value) {
  return normalize(value).replace(/\s+/g, '_') || null
}

module.exports = { normalize, familyKey }
