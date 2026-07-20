const test = require('node:test')
const assert = require('node:assert/strict')
const { TYPES, validateDecision } = require('./model')

function base(type = TYPES.ASSOCIATE_ALIAS) {
  return {
    decision_type: type,
    source_report_id: '11111111-1111-1111-1111-111111111111',
    source_ot: '24530',
    source_filename: '24530 INFORME.xlsx',
    evidence: {
      report_ids: ['11111111-1111-1111-1111-111111111111'],
      filenames: [],
      observations: ['misma función, pauta y estructura'],
    },
    reason: 'Evidencia suficiente',
    created_by: 'admin-1',
    created_at: '2026-07-20T12:00:00.000Z',
    alias: '  Trípode  ',
    target_family: 'luminaria',
  }
}

function rejects(change, pattern) {
  assert.throws(() => validateDecision({ ...base(), ...change }), pattern)
}

test('acepta ASSOCIATE_ALIAS válido y normaliza estable', () => {
  const value = validateDecision(base())
  assert.equal(value.alias, 'TRIPODE')
  assert.equal(value.target_family, 'LUMINARIA')
})

test('acepta CREATE_FAMILY válido', () => {
  const input = base(TYPES.CREATE_FAMILY)
  delete input.alias
  input.target_family = 'bomba de vacío'
  input.aliases = ['Bomba de vacío', ' bomba vacío ']
  const value = validateDecision(input)
  assert.deepEqual(value.aliases, ['BOMBA DE VACIO', 'BOMBA VACIO'])
})

test('acepta REJECT_INSUFFICIENT_EVIDENCE válido', () => {
  const input = base(TYPES.REJECT_INSUFFICIENT_EVIDENCE)
  delete input.alias
  delete input.target_family
  assert.equal(validateDecision(input).decision_type, input.decision_type)
})

test('rechaza tipo desconocido', () => rejects({ decision_type: 'OTHER' }, /desconocido/))
test('rechaza autor ausente', () => rejects({ created_by: ' ' }, /created_by/))
test('rechaza razón vacía', () => rejects({ reason: ' ' }, /reason/))
test('rechaza evidencia vacía', () => rejects({ evidence: {} }, /evidence vacía/))
test('rechaza arrays vacíos como única evidencia', () => rejects({
  evidence: { report_ids: [], filenames: [], observations: [] },
}, /evidence vacía/))
test('rechaza OT origen no trazada', () => rejects({
  evidence: { report_ids: ['otro'], filenames: [], observations: ['parecido'] },
}, /origen no trazada/))
test('rechaza alias sin target_family', () => rejects({ target_family: undefined }, /requeridos/))
test('rechaza rechazo con campos de catálogo', () => rejects({
  decision_type: TYPES.REJECT_INSUFFICIENT_EVIDENCE,
}, /incompatibles/))
test('rechaza propiedades incompatibles', () => rejects({ aliases: ['A'] }, /incompatible/))
test('rechaza familia creada sin clave', () => {
  const input = base(TYPES.CREATE_FAMILY)
  delete input.target_family
  assert.throws(() => validateDecision(input), /target_family/)
})
test('acepta trazabilidad por filename', () => {
  const input = base()
  input.evidence = { report_ids: [], filenames: [input.source_filename], observations: [] }
  assert.equal(validateDecision(input).source_filename, input.source_filename)
})
