const { createHash } = require('node:crypto')
const { TYPES, normalizeAlias, normalizeKey, validateDecision } = require('../decisions/model')
const { certifyFamily } = require('./executable_contract')

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.keys(value).sort().reduce((result, key) => {
    result[key] = canonical(value[key])
    return result
  }, {})
}
function stringify(value) { return JSON.stringify(canonical(value)) }
function normalizeBase(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new Error('snapshot inválido')
  if (!snapshot.aliases || typeof snapshot.aliases !== 'object' || Array.isArray(snapshot.aliases)) throw new Error('snapshot.aliases inválido')
  const aliases = {}
  for (const [rawFamily, values] of Object.entries(snapshot.aliases)) {
    const family = normalizeKey(rawFamily)
    if (aliases[family]) throw new Error(`familia duplicada tras normalización: ${family}`)
    if (!Array.isArray(values)) throw new Error(`aliases inválidos para ${family}`)
    aliases[family] = [...new Set(values.map(normalizeAlias))].sort()
  }
  const owners = new Map()
  for (const [family, values] of Object.entries(aliases)) {
    for (const alias of values) {
      if (owners.has(alias)) throw new Error(`alias ${alias} pertenece a ${owners.get(alias)} y ${family}`)
      owners.set(alias, family)
    }
  }
  return aliases
}
function addAlias(aliases, family, alias) {
  for (const [otherFamily, values] of Object.entries(aliases)) {
    if (otherFamily !== family && values.includes(alias)) throw new Error(`alias ${alias} ya pertenece a ${otherFamily}`)
  }
  aliases[family] = [...new Set([...(aliases[family] || []), alias])].sort()
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
  for (const alias of decision.aliases || (decision.alias ? [decision.alias] : [])) addAlias(aliases, decision.target_family, alias)
}
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}
function output(artifact) {
  const normalized = canonical(artifact)
  const serialized = stringify(normalized)
  return Object.freeze({ artifact: deepFreeze(normalized), serialized, hash: createHash('sha256').update(serialized).digest('hex') })
}
function compileCatalog(snapshot, decisions) {
  if (!Array.isArray(decisions)) throw new Error('decisions debe ser array')
  const aliases = normalizeBase(snapshot)
  const ordered = decisions.map(validateDecision).sort((a, b) => stringify(a).localeCompare(stringify(b)))
  for (const decision of ordered) applyDecision(aliases, decision)
  return output({ aliases })
}
function compileExecutableCatalog(snapshot, decisions) {
  const aliases = compileCatalog(snapshot, decisions).artifact.aliases
  if (!snapshot.families || Array.isArray(snapshot.families) || typeof snapshot.families !== 'object') throw new Error('snapshot.families inválido')
  const sources = {}
  for (const [rawFamily, source] of Object.entries(snapshot.families)) {
    const family = normalizeKey(rawFamily)
    if (sources[family]) throw new Error(`Family ${family} is declared more than once.`)
    sources[family] = source
  }
  const declared = [...new Set([...Object.keys(aliases), ...Object.keys(sources)])].sort()
  const families = {}
  for (const family of declared) {
    if (!aliases[family]) throw new Error(`Family ${family} is not executable. Missing aliases.`)
    if (!sources[family]) throw new Error(`Family ${family} is not executable. Missing family source.`)
    families[family] = certifyFamily(family, aliases[family], sources[family])
  }
  return output({ schema_version: '1.0.0', families })
}
module.exports = { canonical, compileCatalog, compileExecutableCatalog, stringify }
