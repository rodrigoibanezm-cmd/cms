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

test('resolves reviewed RAD torque names', () => {
  expect('LLAVE DE TORQUE RAD MOD E-RAD BLU3000', 'E_RAD', 'CONFIRMED')
  expect('LLAVE TORQUE RAD 50DX', 'LLAVE_DE_TORQUE_O_IMPACTO', 'CONFIRMED')
  expect('LLAVE TORQUE RAD B-RAD 1500-2', 'LLAVE_DE_TORQUE_O_IMPACTO', 'CONFIRMED')
})

test('does not infer E-RAD from transductor context', () => {
  expect('TRASDUCTOR DE TORQUE RAD', 'TRASDUCTOR_DE_TORQUE_RAD', 'UNMAPPED')
})

test('confirms evidence-backed aliases', () => {
  expect('LLAVE DE TORQUE NEUM', 'LLAVE_DE_TORQUE_O_IMPACTO', 'CONFIRMED')
  expect('BATERIA 18V', 'BATERIA', 'CONFIRMED')
  expect('CARRETE ELEC', 'CARRETE_ELECTRICO', 'CONFIRMED')
  expect('GATA NEUMOHID', 'GATA_HIDRAULICA', 'CONFIRMED')
})

test('maps reviewed repeated groups', () => {
  expect('TRIPODE MILWAUKEE', 'LUMINARIA', 'CONFIRMED')
  expect('GRASERA INAL MILWAUKEE', 'GRASERA', 'CONFIRMED')
  expect('BOMBA DE VACIO YELLOW JACKET', 'BOMBA_DE_VACIO', 'CONFIRMED')
  expect('BARREDORA VIPER', 'BARREDORA', 'CONFIRMED')
  expect('DIALIZADORA ELEC SCHROEDER', 'DIALIZADORA', 'CONFIRMED')
  expect('BANDEJA DE DRENADO', 'BANDEJA_DE_DRENADO', 'CONFIRMED')
  expect('MULTI TOOL CATERPILLAR', 'MULTI_TOOL', 'CONFIRMED')
})
