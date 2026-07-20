const test = require('node:test')
const assert = require('node:assert/strict')
const fixture = require('./fixtures/executable_snapshot.json')
const { compileCatalog, compileExecutableCatalog } = require('./compiler')

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function family(snapshot = fixture) {
  return snapshot.families.LUMINARIA
}

test('compila y certifica una familia ejecutable', () => {
  const result = compileExecutableCatalog(clone(fixture), [])
  assert.equal(result.artifact.schema_version, '1.0.0')
  assert.equal(result.artifact.families.LUMINARIA.template_reference.sha256.length, 64)
  assert.ok(Object.isFrozen(result.artifact.families.LUMINARIA.render_mapping))
})

test('orden distinto produce serialización y hash estables', () => {
  const first = clone(fixture)
  const second = { families: first.families, aliases: first.aliases }
  const a = compileExecutableCatalog(first, [])
  const b = compileExecutableCatalog(second, [])
  assert.equal(a.serialized, b.serialized)
  assert.equal(a.hash, b.hash)
})

test('rechaza componente faltante y catálogo parcial', () => {
  const snapshot = clone(fixture)
  snapshot.aliases.TALADRO = ['Taladro']
  snapshot.families.TALADRO = clone(family())
  delete snapshot.families.TALADRO.render_mapping
  assert.throws(() => compileExecutableCatalog(snapshot, []), /missing render_mapping/i)
})

test('rechaza componente vacío', () => {
  const snapshot = clone(fixture)
  family(snapshot).render_mapping.operations = []
  assert.throws(() => compileExecutableCatalog(snapshot, []), /must be non-empty/)
})

test('rechaza operación o celda no soportada', () => {
  const snapshot = clone(fixture)
  family(snapshot).render_mapping.operations[0].op = 'guess_cell'
  assert.throws(() => compileExecutableCatalog(snapshot, []), /unsupported/)
  family(snapshot).render_mapping.operations[0].op = 'set_cell'
  family(snapshot).render_mapping.operations[0].target = 'fila dos'
  assert.throws(() => compileExecutableCatalog(snapshot, []), /target is invalid/)
})

test('rechaza campos desconocidos', () => {
  const snapshot = clone(fixture)
  family(snapshot).validators = { enabled: true }
  assert.throws(() => compileExecutableCatalog(snapshot, []), /unsupported field validators/)
})

test('rechaza referencia de plantilla no verificable', () => {
  const snapshot = clone(fixture)
  family(snapshot).template_reference.sha256 = 'abc'
  assert.throws(() => compileExecutableCatalog(snapshot, []), /sha256 is invalid/)
  family(snapshot).template_reference.sha256 = fixture.families.LUMINARIA.template_reference.sha256
  family(snapshot).template_reference.size_bytes = 0
  assert.throws(() => compileExecutableCatalog(snapshot, []), /size_bytes is invalid/)
})

test('rechaza colisión de familias tras normalización', () => {
  const snapshot = clone(fixture)
  snapshot.aliases['LUMINARIA PEDESTAL'] = ['Trípode pedestal']
  snapshot.aliases.LUMINARIA_PEDESTAL = ['Foco pedestal']
  assert.throws(() => compileCatalog(snapshot, []), /duplicada tras normalización/)
})

test('normaliza aliases y rechaza propiedad cruzada', () => {
  const snapshot = clone(fixture)
  snapshot.aliases.LUMINARIA = ['Trípode', 'tripode']
  snapshot.aliases.TALADRO = ['TRÍPODE']
  assert.throws(() => compileCatalog(snapshot, []), /pertenece a LUMINARIA y TALADRO/)
})

test('el artefacto no cambia al mutar la fuente', () => {
  const snapshot = clone(fixture)
  const result = compileExecutableCatalog(snapshot, [])
  family(snapshot).render_mapping.operations[0].target = 'Z99'
  snapshot.aliases.LUMINARIA.push('OTRA')
  assert.equal(result.artifact.families.LUMINARIA.render_mapping.operations[0].target, 'B2')
  assert.deepEqual(result.artifact.families.LUMINARIA.aliases, ['LUMINARIA', 'TRIPODE'])
})
