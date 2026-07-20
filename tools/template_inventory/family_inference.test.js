const test = require('node:test')
const assert = require('node:assert/strict')
const { containsWords, inferFamily } = require('./family_inference')

test('matches aliases as complete word sequences', () => {
  assert.equal(containsWords('LLAVE TORQUE RAD', 'E RAD'), false)
  assert.equal(containsWords('E-RAD LLAVE TORQUE', 'E RAD'), true)
})

test('avoids false REVIEW from RAD suffix', () => {
  const result = inferFamily('23517 INFORME TÉCNICO LLAVE TORQUE RAD 1500.xlsx')
  assert.deepEqual(result, {
    family: 'LLAVE_DE_TORQUE_O_IMPACTO',
    status: 'CONFIRMED',
  })
})
