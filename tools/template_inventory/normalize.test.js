const test = require('node:test')
const assert = require('node:assert/strict')
const { normalize, familyKey } = require('./normalize')

 test('normalizes OT filenames', () => {
  assert.equal(normalize('OT 24530 - Torque Manual.xlsx'), 'TORQUE MANUAL')
  assert.equal(familyKey('OT_24530-Torque Manual.xlsx'), 'TORQUE_MANUAL')
})
