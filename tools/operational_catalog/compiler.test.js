const test = require('node:test')
const assert = require('node:assert/strict')
const { compileDecision } = require('./compiler')

const base = { aliases: { LUMINARIA: ['LUMINARIA'] } }

function decision(overrides = {}) {
  return {
    decision_type: 'ASSOCIATE_EXISTING_FAMILY',
    source_ot: '90001',
    target_family_key: 'LUMINARIA',
    aliases: ['LUZ PEDESTAL'],
    reason: 'misma función, pauta y estructura',
    author_id: 'admin-1',
    ...overrides,
  }
}

test('adds alias, bumps patch and reproceses only source OT', () => {
  const result = compileDecision({ catalog: base, version: '1.0.0', decision: decision() })
  assert.equal(result.ok, true)
  assert.equal(result.version, '1.0.1')
  assert.equal(result.reprocess_ot, '90001')
  assert.deepEqual(result.catalog.aliases.LUMINARIA, ['LUMINARIA', 'LUZ PEDESTAL'])
})

test('creates family and bumps minor', () => {
  const result = compileDecision({
    catalog: base,
    version: '1.0.1',
    decision: decision({
      decision_type: 'CREATE_FAMILY',
      family_key: 'SUNCHADORA',
      target_family_key: undefined,
      aliases: ['SUNCHADORA'],
    }),
  })
  assert.equal(result.version, '1.1.0')
  assert.deepEqual(result.catalog.aliases.SUNCHADORA, ['SUNCHADORA'])
})

test('rejection does not change catalog or trigger reprocess', () => {
  const result = compileDecision({
    catalog: base,
    version: '1.0.0',
    decision: decision({
      decision_type: 'REJECT_INSUFFICIENT_INFORMATION',
      target_family_key: undefined,
      aliases: [],
    }),
  })
  assert.equal(result.changed, false)
  assert.equal(result.reprocess_ot, null)
  assert.equal(result.version, '1.0.0')
})

test('rejects decisions without traceability', () => {
  const result = compileDecision({
    catalog: base,
    version: '1.0.0',
    decision: decision({ author_id: '' }),
  })
  assert.equal(result.ok, false)
  assert.match(result.errors.join(' '), /author_id/)
})
