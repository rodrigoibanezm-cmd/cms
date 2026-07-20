const test = require('node:test')
const assert = require('node:assert/strict')
const snapshot = require('./executable_luminaria.json')
const { compileExecutableCatalog } = require('../../compiler/compiler')

const family = snapshot.families.LUMINARIA

test('LUMINARIA compila como primera familia ejecutable', () => {
  const result = compileExecutableCatalog(snapshot, [])
  assert.equal(result.artifact.schema_version, '1.0.0')
  assert.deepEqual(result.artifact.families.LUMINARIA.aliases, [
    'LUMINARIA',
    'LUMINARIA DE PEDESTAL',
    'LUMINARIA INALAMBRICA',
    'LUMINARIA PEDESTAL',
    'TRIPODE',
    'UMINARIA',
  ])
})

test('certifica el maestro corregido por hash y tamaño', () => {
  assert.equal(family.template_reference.filename, 'LUMINARIA_FINAL.xlsm')
  assert.equal(family.template_reference.drive_file_id, '1hvXk282YSIhvcN6yzAm9U4SyDIjTassV')
  assert.equal(family.template_reference.sha256, 'd5e851a95d0d7e25ab124c900e928cad443b8422c1c0ed6b8547744e32a6ae1a')
  assert.equal(family.template_reference.size_bytes, 47194)
})

test('mapea solo entradas directas soportadas por el contrato v1', () => {
  assert.deepEqual(family.render_mapping.operations, [
    { op: 'set_cell', source: 'extraction.marca', target: 'D7' },
    { op: 'set_cell', source: 'extraction.modelo', target: 'D8' },
    { op: 'set_cell', source: 'report.ot', target: 'I9' },
  ])
  assert.equal(family.render_metadata.sheet_index, 0)
})
