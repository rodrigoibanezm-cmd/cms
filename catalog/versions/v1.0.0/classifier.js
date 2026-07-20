const baseCatalog = require('./families.json')
const finalCatalog = require('./families_stage0_final.json')
const { normalize, familyKey } = require('./normalize')

const catalog = {
  aliases: { ...baseCatalog.aliases, ...finalCatalog.aliases },
}

function containsWords(name, alias) {
  const normalizedName = ` ${normalize(name)} `
  const normalizedAlias = ` ${normalize(alias)} `
  return normalizedName.includes(normalizedAlias)
}

function matchesAlias(name, aliases) {
  return aliases.some((alias) => containsWords(name, alias))
}

function inferRadTorque(filename) {
  const isTorque = containsWords(filename, 'LLAVE TORQUE')
    || containsWords(filename, 'LLAVE DE TORQUE')
  const isExplicitERad = isTorque && containsWords(filename, 'E RAD')

  if (isExplicitERad) {
    return { family: 'E_RAD', status: 'CONFIRMED' }
  }

  const isTorqueRad = containsWords(filename, 'LLAVE TORQUE RAD')
    || containsWords(filename, 'LLAVE DE TORQUE RAD')

  if (!isTorqueRad) return null
  return { family: 'LLAVE_DE_TORQUE_O_IMPACTO', status: 'CONFIRMED' }
}

function inferFamily(filename) {
  const radTorque = inferRadTorque(filename)
  if (radTorque) return radTorque

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

module.exports = { containsWords, inferFamily, inferRadTorque }
