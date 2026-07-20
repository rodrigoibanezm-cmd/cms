const test = require('node:test')
const assert = require('node:assert/strict')
const snapshot = require('./executable_esmeril.json')
const { compileExecutableCatalog } = require('../../compiler/compiler')

const family = snapshot.families.ESMERIL

test('ESMERIL compila como segunda familia ejecutable', () => {
  const result = compileExecutableCatalog(snapshot, [])
  assert.equal(result.artifact.schema_version, '1.0.0')
  assert.deepEqual(result.artifact.families.ESMERIL.aliases, [
    'ESMERIL',
    'ESMERIL ELECTRICO',
    'ESMERIL INALAMBRICO',
    'PULIDOR',
    'PULIDOR INALAMBRICO',
  ])
})

test('certifica ESMERIL_FINAL por hash y tamaño', () => {
  assert.equal(family.template_reference.filename, 'ESMERIL_FINAL.xlsx')
  assert.equal(family.template_reference.drive_file_id, '1reHRuTAXxVC4-wy-4uw-z0BUuuQaxrzG')
  assert.equal(family.template_reference.sha256, '83282d57a5776ab90808aee775822d6f6edaa40aa9272e39d9c4b386c668c476')
  assert.equal(family.template_reference.size_bytes, 33849)
})

test('mapea solo entradas directas certificadas', () => {
  assert.deepEqual(family.render_mapping.operations, [
    { op: 'set_cell', source: 'extraction.marca', target: 'D8' },
    { op: 'set_cell', source: 'extraction.modelo', target: 'D9' },
    { op: 'set_cell', source: 'report.ot', target: 'I11' },
  ])
  assert.equal(family.render_metadata.sheet_index, 0)
})
