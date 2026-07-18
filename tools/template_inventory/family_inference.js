const catalog = require('./families.json')
const { normalize, familyKey } = require('./normalize')

function matchesAlias(name, aliases) {
  const normalized = normalize(name)
  return aliases.some((alias) => normalized.includes(normalize(alias)))
}

function inferFamily(filename) {
  const matches = Object.entries(catalog.aliases)
    .filter(([, aliases]) => matchesAlias(filename, aliases))
    .map(([family]) => family)

  if (matches.length === 1) {
    return { family: matches[0], status: 'CONFIRMED' }
  }

  if (matches.length > 1) {
    return { family: matches.join('|'), status: 'REVIEW' }
  }

  return { family: familyKey(filename), status: 'UNMAPPED' }
}

module.exports = { inferFamily }
