const catalog = require('./families.json')
const { normalize, familyKey } = require('./normalize')

const RAD_TORQUE_FAMILIES = 'E_RAD|LLAVE_DE_TORQUE_O_IMPACTO'

function containsWords(name, alias) {
  const normalizedName = ` ${normalize(name)} `
  const normalizedAlias = ` ${normalize(alias)} `
  return normalizedName.includes(normalizedAlias)
}

function matchesAlias(name, aliases) {
  return aliases.some((alias) => containsWords(name, alias))
}

function hasRadTorqueAmbiguity(filename) {
  return containsWords(filename, 'LLAVE TORQUE RAD')
    || containsWords(filename, 'LLAVE DE TORQUE RAD')
}

function inferFamily(filename) {
  if (hasRadTorqueAmbiguity(filename)) {
    return { family: RAD_TORQUE_FAMILIES, status: 'REVIEW' }
  }

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

module.exports = { containsWords, hasRadTorqueAmbiguity, inferFamily }