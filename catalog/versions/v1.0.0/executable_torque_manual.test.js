const test = require('node:test')
const assert = require('node:assert/strict')
const snapshot = require('./executable_torque_manual.json')
const { compileExecutableCatalog } = require('../../compiler/compiler')

const family = snapshot.families.TORQUE_MANUAL

test('TORQUE_MANUAL compila como tercera familia ejecutable', () => {
  const result = compileExecutableCatalog(snapshot, [])
  assert.equal(result.artifact.schema_version, '1.0.0')
  assert.deepEqual(result.artifact.families.TORQUE_MANUAL.aliases, [
    'TORQUE MANUAL',
    'TORQUIMETRO MANUAL',
  ])
})

test('certifica TORQUE_MANUAL_FINAL por hash y tamaño', () => {
  assert.equal(family.template_reference.filename, 'TORQUE_MANUAL_FINAL.xlsx')
  assert.equal(family.template_reference.drive_file_id, '1TV_3hb7v5pwkjGgcXaF_k74uUA6o6uoO')
  assert.equal(family.template_reference.sha256, '94673825c7f0b1b36e4bf9d840fc8c6bedf67ac770f43ec6094b9f4575c15bd0')
  assert.equal(family.template_reference.size_bytes, 121247)
})

test('mapea solo entradas directas certificadas', () => {
  assert.deepEqual(family.render_mapping.operations, [
    { op: 'set_cell', source: 'extraction.marca', target: 'D7' },
    { op: 'set_cell', source: 'extraction.modelo', target: 'D8' },
    { op: 'set_cell', source: 'report.ot', target: 'I10' },
  ])
  assert.equal(family.render_metadata.sheet_index, 0)
})
