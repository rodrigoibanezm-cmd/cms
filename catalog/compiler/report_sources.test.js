const test = require('node:test')
const assert = require('node:assert/strict')
const { REPORT_SOURCES, certifyFamily } = require('./executable_contract')
const fixture = require('./fixtures/executable_snapshot.json')

function clone(value) { return JSON.parse(JSON.stringify(value)) }

test('el contrato de fuentes no puede ampliarse en runtime', () => {
  assert.ok(Object.isFrozen(REPORT_SOURCES))
  assert.throws(() => REPORT_SOURCES.push('extraction.campo_inventado'), TypeError)
  assert.equal(REPORT_SOURCES.includes('extraction.campo_inventado'), false)
  const source = clone(fixture.families.LUMINARIA)
  source.classifier.source_field = 'extraction.campo_inventado'
  assert.throws(() => certifyFamily('LUMINARIA', ['LUMINARIA'], source), /supported report source/)
})
