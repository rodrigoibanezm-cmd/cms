const test = require('node:test')
const assert = require('node:assert/strict')
const { compileCatalog } = require('../compiler/compiler')
const { createVersionManifest } = require('./manifest')

const HASH_A = 'a'.repeat(64)
const HASH_B = 'b'.repeat(64)
const snapshot = { aliases: { LUMINARIA: ['LUMINARIA'] } }

function input(change = {}) {
  return {
    version: '1.1.0',
    parent_version: '1.0.0',
    compiled_catalog: compileCatalog(snapshot, []),
    decisions_hash: HASH_A,
    compiler_version: '1.0.0',
    ...change,
  }
}

test('mismas entradas producen mismo manifest', () => {
  const first = createVersionManifest(input())
  const second = createVersionManifest(input())
  assert.equal(first.serialized, second.serialized)
  assert.deepEqual(first.manifest, second.manifest)
})

test('cambiar compiler_version cambia manifest', () => {
  const first = createVersionManifest(input())
  const second = createVersionManifest(input({ compiler_version: '1.0.1' }))
  assert.notEqual(first.serialized, second.serialized)
})

test('cambiar parent_version cambia manifest', () => {
  const first = createVersionManifest(input())
  const second = createVersionManifest(input({ parent_version: '1.0.1' }))
  assert.notEqual(first.serialized, second.serialized)
})

test('usa el hash del catálogo compilado, no del manifest', () => {
  const compiled = { artifact: {}, serialized: '{}', hash: HASH_B }
  const result = createVersionManifest(input({ compiled_catalog: compiled }))
  assert.equal(result.manifest.catalog_hash, HASH_B)
})

test('cambiar decisions_hash cambia manifest', () => {
  const first = createVersionManifest(input())
  const second = createVersionManifest(input({ decisions_hash: HASH_B }))
  assert.notEqual(first.serialized, second.serialized)
})

test('no agrega datos variables', () => {
  assert.deepEqual(Object.keys(createVersionManifest(input()).manifest).sort(), [
    'catalog_hash', 'compiler_version', 'decisions_hash',
    'parent_version', 'schema_version', 'version',
  ])
})

test('rechaza hashes inválidos y propiedades desconocidas', () => {
  assert.throws(() => createVersionManifest(input({ decisions_hash: 'x' })), /SHA-256/)
  assert.throws(() => createVersionManifest({ ...input(), created_at: 'ahora' }), /desconocidas/)
})
