const { createHash } = require('node:crypto')
const { TYPES, validateDecision } = require('../decisions/model')

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

function normalizeBase(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('snapshot inválido')
  }
  if (!snapshot.aliases || typeof snapshot.aliases !== 'object' || Array.isArray(snapshot.aliases)) {
    throw new Error('snapshot.aliases inválido')
  }
  const aliases = {}
  for (const family of Object.keys(snapshot.aliases).sort()) {
    const values = snapshot.aliases[family]
    if (!Array.isArray(values)) throw new Error(`aliases inválidos para ${family}`)
    aliases[family] = [...new Set(values)].sort()
  }
  return aliases
}

function decisionKey(decision) {
  return stringify(decision)
}

function addAlias(aliases, family, alias) {
  if (!aliases[family]) aliases[family] = []
  for (const [otherFamily, values] of Object.entries(aliases)) {
    if (otherFamily !== family && values.includes(alias)) {
      throw new Error(`alias ${alias} ya pertenece a ${otherFamily}`)
    }
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

function compileCatalog(snapshot, decisions) {
  if (!Array.isArray(decisions)) throw new Error('decisions debe ser array')
  const aliases = normalizeBase(snapshot)
  const normalized = decisions.map(validateDecision).sort((a, b) => decisionKey(a).localeCompare(decisionKey(b)))
  for (const decision of normalized) applyDecision(aliases, decision)
  const artifact = canonical({ aliases })
  const serialized = stringify(artifact)
  return Object.freeze({ artifact, serialized, hash: createHash('sha256').update(serialized).digest('hex') })
}

module.exports = { canonical, compileCatalog, stringify }
