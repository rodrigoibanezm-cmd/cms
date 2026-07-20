const crypto = require('node:crypto')
const { validateDecision } = require('./validator')
const { nextVersion } = require('./version')

function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function addAliases(catalog, family, aliases) {
  const current = catalog.aliases[family] || []
  return [...new Set([...current, ...aliases])].sort()
}

function compileDecision({ catalog, version, decision }) {
  const errors = validateDecision(decision, catalog)
  if (errors.length) return { ok: false, errors }

  if (decision.decision_type === 'REJECT_INSUFFICIENT_INFORMATION') {
    return { ok: true, changed: false, version, catalog, reprocess_ot: null }
  }

  const family = decision.decision_type === 'CREATE_FAMILY'
    ? decision.family_key
    : decision.target_family_key
  const aliases = addAliases(catalog, family, decision.aliases || [])
  const compiled = { aliases: { ...catalog.aliases, [family]: aliases } }
  const compiledVersion = nextVersion(version, decision.decision_type)

  return {
    ok: true,
    changed: true,
    version: compiledVersion,
    previous_version: version,
    catalog: compiled,
    artifacts_hash: stableHash(compiled),
    reprocess_ot: decision.source_ot,
  }
}

module.exports = { compileDecision, stableHash }
