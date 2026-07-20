const { createHash } = require('node:crypto')
const { TYPES, normalizeKey, validateDecision } = require('../decisions/model')
const FAMILY_FIELDS = Object.freeze([
  'classifier', 'template_reference', 'render_mapping', 'render_metadata',
])

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.keys(value).sort().reduce((result, key) => {
    result[key] = canonical(value[key])
    return result
  }, {})
}
function stringify(value) {
  return JSON.stringify(canonical(value))
}
function object(value, field, { nonEmpty = false } = {}) {
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error(`${field} inválido`)
  if (nonEmpty && !Object.keys(value).length) throw new Error(`${field} vacío`)
  return value
}

function normalizeBase(snapshot) {
  object(snapshot, 'snapshot')
  object(snapshot.aliases, 'snapshot.aliases')
  const aliases = {}
  for (const family of Object.keys(snapshot.aliases).sort()) {
    const values = snapshot.aliases[family]
    if (!Array.isArray(values)) throw new Error(`aliases inválidos para ${family}`)
    aliases[normalizeKey(family)] = [...new Set(values)].sort()
  }
  return aliases
}
function addAlias(aliases, family, alias) {
  if (!aliases[family]) aliases[family] = []
  for (const [otherFamily, values] of Object.entries(aliases)) {
    if (otherFamily !== family && values.includes(alias)) throw new Error(`alias ${alias} ya pertenece a ${otherFamily}`)
  }
  aliases[family] = [...new Set([...aliases[family], alias])].sort()
}
function applyDecision(aliases, decision) {
  if (decision.decision_type === TYPES.REJECT_INSUFFICIENT_EVIDENCE) return
  if (decision.decision_type === TYPES.ASSOCIATE_ALIAS) {
    if (!aliases[decision.target_family]) throw new Error('target_family inexistente')
    addAlias(aliases, decision.target_family, decision.alias)
    return
  }
  if (aliases[decision.target_family]) throw new Error('familia ya existente')
  aliases[decision.target_family] = []
  const values = decision.aliases || (decision.alias ? [decision.alias] : [])
  for (const alias of values) addAlias(aliases, decision.target_family, alias)
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}
function result(artifact) {
  const serialized = stringify(artifact)
  return Object.freeze({
    artifact: deepFreeze(artifact), serialized,
    hash: createHash('sha256').update(serialized).digest('hex'),
  })
}
function compileCatalog(snapshot, decisions) {
  if (!Array.isArray(decisions)) throw new Error('decisions debe ser array')
  const aliases = normalizeBase(snapshot)
  const normalized = decisions.map(validateDecision)
    .sort((a, b) => stringify(a).localeCompare(stringify(b)))
  for (const decision of normalized) applyDecision(aliases, decision)
  return result(canonical({ aliases }))
}

function familySources(snapshot) {
  const sources = object(snapshot.families, 'snapshot.families')
  return Object.entries(sources).reduce((result, [name, source]) => {
    const key = normalizeKey(name)
    if (result[key]) throw new Error(`Family ${key} is declared more than once.`)
    result[key] = object(source, `Family ${key}`)
    return result
  }, {})
}
function certifyFamily(name, source, aliases) {
  const unknown = Object.keys(source).filter((field) => !FAMILY_FIELDS.includes(field))
  if (unknown.length) throw new Error(`Family ${name} has unsupported field ${unknown.sort()[0]}.`)
  for (const field of FAMILY_FIELDS) {
    if (source[field] === undefined) throw new Error(`Family ${name} is not executable. Missing ${field}.`)
    object(source[field], `Family ${name}.${field}`, { nonEmpty: true })
  }
  const template = source.template_reference
  if (typeof template.filename !== 'string' || !template.filename.trim()) {
    throw new Error(`Family ${name} is not executable. Missing template_reference.filename.`)
  }
  if (typeof template.drive_file_id !== 'string' || !template.drive_file_id.trim()) {
    throw new Error(`Family ${name} is not executable. Missing template_reference.drive_file_id.`)
  }
  return canonical({ aliases, ...source })
}
function compileExecutableCatalog(snapshot, decisions) {
  const aliases = compileCatalog(snapshot, decisions).artifact.aliases
  const sources = familySources(snapshot)
  const declared = [...new Set([...Object.keys(aliases), ...Object.keys(sources)])].sort()
  const families = {}
  for (const name of declared) {
    if (!aliases[name]) throw new Error(`Family ${name} is not executable. Missing aliases.`)
    if (!sources[name]) throw new Error(`Family ${name} is not executable. Missing family source.`)
    families[name] = certifyFamily(name, sources[name], aliases[name])
  }
  return result(canonical({ schema_version: '1.0.0', families }))
}

module.exports = { canonical, compileCatalog, compileExecutableCatalog, stringify }
