const TYPES = Object.freeze({
  ASSOCIATE_ALIAS: 'ASSOCIATE_ALIAS',
  CREATE_FAMILY: 'CREATE_FAMILY',
  REJECT_INSUFFICIENT_EVIDENCE: 'REJECT_INSUFFICIENT_EVIDENCE',
})

const COMMON = [
  'decision_type', 'source_report_id', 'source_ot', 'source_filename',
  'evidence', 'reason', 'created_by', 'created_at',
]
const OPTIONAL = ['target_family', 'alias', 'aliases']
const ALLOWED = new Set([...COMMON, ...OPTIONAL])
const EVIDENCE_FIELDS = ['report_ids', 'filenames', 'observations']
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function text(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} requerido`)
  return value.trim()
}

function normalize(value, field, separator) {
  const result = text(value, field).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toUpperCase()
    .replace(/[^A-Z0-9]+/g, separator).replace(separator === '_' ? /^_+|_+$/g : /^ +| +$/g, '')
  if (!result) throw new Error(`${field} no normalizable`)
  return result
}

function normalizeKey(value, field = 'target_family') {
  return normalize(value, field, '_')
}

function normalizeAlias(value) {
  return normalize(value, 'alias', ' ').replace(/\s+/g, ' ')
}

function stringArray(value, field, { nonEmpty = false } = {}) {
  if (!Array.isArray(value)) throw new Error(`${field} debe ser array`)
  if (nonEmpty && !value.length) throw new Error(`${field} no puede estar vacío`)
  return value.map((item) => text(item, field))
}

function validateEvidence(value, reportId, filename) {
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('evidence debe ser objeto')
  if (Object.keys(value).some((key) => !EVIDENCE_FIELDS.includes(key))) throw new Error('evidence contiene propiedades desconocidas')
  for (const field of EVIDENCE_FIELDS) if (value[field] === undefined) throw new Error(`evidence.${field} requerido`)
  const reportIds = stringArray(value.report_ids, 'evidence.report_ids')
  const filenames = stringArray(value.filenames, 'evidence.filenames')
  const observations = stringArray(value.observations, 'evidence.observations')
  if (!reportIds.length && !filenames.length && !observations.length) throw new Error('evidence vacía')
  if (!reportIds.includes(reportId) && !filenames.includes(filename)) throw new Error('OT origen no trazada')
  return { report_ids: reportIds, filenames, observations }
}

function assertCompatibility(value) {
  const type = value.decision_type
  if (type === TYPES.ASSOCIATE_ALIAS) {
    if (value.aliases !== undefined) throw new Error('aliases incompatible')
    if (value.alias === undefined || value.target_family === undefined) throw new Error('alias y target_family requeridos')
  }
  if (type === TYPES.CREATE_FAMILY) {
    if (value.target_family === undefined) throw new Error('target_family requerido')
    if (value.alias !== undefined && value.aliases !== undefined) throw new Error('alias y aliases son excluyentes')
    if (value.aliases !== undefined && (!Array.isArray(value.aliases) || !value.aliases.length)) throw new Error('aliases no puede estar vacío')
  }
  if (type === TYPES.REJECT_INSUFFICIENT_EVIDENCE
    && OPTIONAL.some((field) => value[field] !== undefined)) throw new Error('campos de catálogo incompatibles con rechazo')
}

function validateDecision(input) {
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('decisión inválida')
  if (Object.keys(input).some((key) => !ALLOWED.has(key))) throw new Error('propiedades desconocidas')
  for (const field of COMMON) if (input[field] === undefined) throw new Error(`${field} requerido`)
  if (!Object.values(TYPES).includes(input.decision_type)) throw new Error('decision_type desconocido')
  const reportId = text(input.source_report_id, 'source_report_id')
  if (!UUID.test(reportId)) throw new Error('source_report_id debe ser UUID')
  const filename = text(input.source_filename, 'source_filename')
  const date = new Date(text(input.created_at, 'created_at'))
  if (Number.isNaN(date.getTime())) throw new Error('created_at inválido')
  assertCompatibility(input)
  const result = {
    decision_type: input.decision_type, source_report_id: reportId,
    source_ot: text(input.source_ot, 'source_ot'), source_filename: filename,
    evidence: validateEvidence(input.evidence, reportId, filename),
    reason: text(input.reason, 'reason'), created_by: text(input.created_by, 'created_by'),
    created_at: date.toISOString(),
  }
  if (input.target_family !== undefined) result.target_family = normalizeKey(input.target_family)
  if (input.alias !== undefined) result.alias = normalizeAlias(input.alias)
  if (input.aliases !== undefined) result.aliases = stringArray(input.aliases, 'aliases', { nonEmpty: true }).map(normalizeAlias)
  return Object.freeze(result)
}

module.exports = { TYPES, normalizeAlias, normalizeKey, validateDecision }
