const TYPES = Object.freeze({
  ASSOCIATE_ALIAS: 'ASSOCIATE_ALIAS',
  CREATE_FAMILY: 'CREATE_FAMILY',
  REJECT_INSUFFICIENT_EVIDENCE: 'REJECT_INSUFFICIENT_EVIDENCE',
})

const REQUIRED = [
  'decision_type', 'source_report_id', 'source_ot', 'source_filename',
  'evidence', 'reason', 'created_by', 'created_at',
]

function text(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} requerido`)
  return value.trim()
}

function normalizeKey(value, field = 'target_family') {
  const normalized = text(value, field).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  if (!normalized) throw new Error(`${field} no normalizable`)
  return normalized
}

function normalizeAlias(value) {
  const normalized = text(value, 'alias').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!normalized) throw new Error('alias no normalizable')
  return normalized
}

function stringArray(value, field) {
  if (!Array.isArray(value)) throw new Error(`${field} debe ser array`)
  return value.map((item) => text(item, field))
}

function validateEvidence(evidence, sourceReportId, sourceFilename) {
  if (!evidence || Array.isArray(evidence) || typeof evidence !== 'object') {
    throw new Error('evidence debe ser objeto')
  }
  const reportIds = stringArray(evidence.report_ids || [], 'evidence.report_ids')
  const filenames = stringArray(evidence.filenames || [], 'evidence.filenames')
  const observations = stringArray(evidence.observations || [], 'evidence.observations')
  if (!reportIds.length && !filenames.length && !observations.length) throw new Error('evidence vacía')
  if (!reportIds.includes(sourceReportId) && !filenames.includes(sourceFilename)) {
    throw new Error('OT origen no trazada')
  }
  return { report_ids: reportIds, filenames, observations }
}

function assertCompatibility(value) {
  const type = value.decision_type
  if (type === TYPES.ASSOCIATE_ALIAS) {
    if (value.aliases !== undefined) throw new Error('aliases incompatible')
    if (value.alias === undefined || value.target_family === undefined) throw new Error('alias y target_family requeridos')
  }
  if (type === TYPES.CREATE_FAMILY && value.target_family === undefined) throw new Error('target_family requerido')
  if (type === TYPES.REJECT_INSUFFICIENT_EVIDENCE
    && ['alias', 'aliases', 'target_family'].some((field) => value[field] !== undefined)) {
    throw new Error('campos de catálogo incompatibles con rechazo')
  }
}

function validateDecision(input) {
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('decisión inválida')
  for (const field of REQUIRED) if (input[field] === undefined) throw new Error(`${field} requerido`)
  if (!Object.values(TYPES).includes(input.decision_type)) throw new Error('decision_type desconocido')
  const sourceReportId = text(input.source_report_id, 'source_report_id')
  const sourceFilename = text(input.source_filename, 'source_filename')
  assertCompatibility(input)
  const result = {
    decision_type: input.decision_type,
    source_report_id: sourceReportId,
    source_ot: text(input.source_ot, 'source_ot'),
    source_filename: sourceFilename,
    evidence: validateEvidence(input.evidence, sourceReportId, sourceFilename),
    reason: text(input.reason, 'reason'),
    created_by: text(input.created_by, 'created_by'),
    created_at: text(input.created_at, 'created_at'),
  }
  if (input.target_family !== undefined) result.target_family = normalizeKey(input.target_family)
  if (input.alias !== undefined) result.alias = normalizeAlias(input.alias)
  if (input.aliases !== undefined) result.aliases = stringArray(input.aliases, 'aliases').map(normalizeAlias)
  return Object.freeze(result)
}

module.exports = { TYPES, normalizeAlias, normalizeKey, validateDecision }
