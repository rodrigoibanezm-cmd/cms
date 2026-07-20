const { stringify } = require('../compiler/compiler')

const FIELDS = [
  'version', 'parent_version', 'compiled_catalog',
  'decisions_hash', 'compiler_version',
]

function nonblank(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} requerido`)
  return value.trim()
}

function hash(value, field) {
  const normalized = nonblank(value, field).toLowerCase()
  if (!/^[0-9a-f]{64}$/.test(normalized)) throw new Error(`${field} debe ser SHA-256`)
  return normalized
}

function validateInput(input) {
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('input inválido')
  if (Object.keys(input).some((key) => !FIELDS.includes(key))) throw new Error('propiedades desconocidas')
  for (const field of FIELDS) if (input[field] === undefined) throw new Error(`${field} requerido`)
  const compiled = input.compiled_catalog
  if (!compiled || typeof compiled !== 'object' || Array.isArray(compiled)) {
    throw new Error('compiled_catalog inválido')
  }
  return compiled
}

function createVersionManifest(input) {
  const compiled = validateInput(input)
  const manifest = {
    schema_version: '1',
    version: nonblank(input.version, 'version'),
    parent_version: input.parent_version === null
      ? null
      : nonblank(input.parent_version, 'parent_version'),
    catalog_hash: hash(compiled.hash, 'compiled_catalog.hash'),
    decisions_hash: hash(input.decisions_hash, 'decisions_hash'),
    compiler_version: nonblank(input.compiler_version, 'compiler_version'),
  }
  const serialized = stringify(manifest)
  return Object.freeze({ manifest: Object.freeze(manifest), serialized })
}

module.exports = { createVersionManifest }
