const TYPES = new Set([
  'ASSOCIATE_EXISTING_FAMILY',
  'CREATE_FAMILY',
  'REJECT_INSUFFICIENT_INFORMATION',
])

function requireText(value, field, errors) {
  if (typeof value !== 'string' || !value.trim()) errors.push(`${field} is required`)
}

function validateDecision(decision, catalog) {
  const errors = []
  if (!decision || typeof decision !== 'object') return ['decision is required']

  if (!TYPES.has(decision.decision_type)) errors.push('invalid decision_type')
  requireText(decision.source_ot, 'source_ot', errors)
  requireText(decision.reason, 'reason', errors)
  requireText(decision.author_id, 'author_id', errors)

  const aliases = decision.aliases || []
  if (!Array.isArray(aliases)) errors.push('aliases must be an array')
  if (aliases.some((alias) => typeof alias !== 'string' || !alias.trim())) {
    errors.push('aliases must contain non-empty strings')
  }

  if (decision.decision_type === 'CREATE_FAMILY') {
    requireText(decision.family_key, 'family_key', errors)
    if (!aliases.length) errors.push('CREATE_FAMILY requires aliases')
    if (catalog.aliases[decision.family_key]) errors.push('family already exists')
  }

  if (decision.decision_type === 'ASSOCIATE_EXISTING_FAMILY') {
    requireText(decision.target_family_key, 'target_family_key', errors)
    if (!catalog.aliases[decision.target_family_key]) errors.push('target family not found')
  }

  return errors
}

module.exports = { TYPES, validateDecision }
