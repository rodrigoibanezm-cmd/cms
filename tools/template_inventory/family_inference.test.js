const test = require('node:test')
const assert = require('node:assert/strict')
const { containsWords, inferFamily } = require('./family_inference')

function expect(filename, family, status) {
  assert.deepEqual(inferFamily(filename), { family, status })
}

test('matches aliases as complete word sequences', () => {
  assert.equal(containsWords('LLAVE TORQUE RAD', 'E RAD'), false)
  assert.equal(containsWords('E-RAD LLAVE TORQUE', 'E RAD'), true)
})

test('keeps RAD torque names in review', () => {
  expect('LLAVE TORQUE RAD', 'E_RAD|LLAVE_DE_TORQUE_O_IMPACTO', 'REVIEW')
  expect('LLAVE DE TORQUE RAD', 'E_RAD|LLAVE_DE_TORQUE_O_IMPACTO', 'REVIEW')
})

test('does not infer E-RAD from transductor context', () => {
  expect(
    'TRASDUCTOR DE TORQUE RAD',
    'TRASDUCTOR_DE_TORQUE_RAD',
    'UNMAPPED',
  )
})

test('confirms evidence-backed aliases', () => {
  expect('LLAVE DE TORQUE NEUM', 'LLAVE_DE_TORQUE_O_IMPACTO', 'CONFIRMED')
  expect('BATERIA 18V', 'BATERIA', 'CONFIRMED')
  expect('CARRETE ELEC', 'CARRETE_ELECTRICO', 'CONFIRMED')
  expect('GATA NEUMOHID', 'GATA_HIDRAULICA', 'CONFIRMED')
})

test('maps tripod naming to luminaria evidence', () => {
  expect('TRIPODE MILWAUKEE', 'LUMINARIA', 'CONFIRMED')
  expect('LUMINARIA DE PEDESTAL MILWAUKEE', 'LUMINARIA', 'CONFIRMED')
})

test('maps grasera reports to their own family', () => {
  expect('GRASERA INAL MILWAUKEE', 'GRASERA', 'CONFIRMED')
  expect('GRASERA INALAMBRICA 10.000 PSI', 'GRASERA', 'CONFIRMED')
})

test('maps bomba de vacio reports to their own family', () => {
  expect('BOMBA DE VACIO YELLOW JACKET', 'BOMBA_DE_VACIO', 'CONFIRMED')
  expect('BOMBA DE VACÍO ELEC SUPEREVAC', 'BOMBA_DE_VACIO', 'CONFIRMED')
})

test('maps barredora reports to their own family', () => {
  expect('BARREDORA KARCHER', 'BARREDORA', 'CONFIRMED')
  expect('BARREDORA VIPER', 'BARREDORA', 'CONFIRMED')
})

test('maps dializadora reports to their own family', () => {
  expect('DIALIZADORA ELECTROHIDRAULICA', 'DIALIZADORA', 'CONFIRMED')
  expect('DIALIZADORA ELEC SCHROEDER', 'DIALIZADORA', 'CONFIRMED')
})
