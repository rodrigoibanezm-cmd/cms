const test = require('node:test')
const assert = require('node:assert/strict')
const { TYPES, validateDecision } = require('./model')

function base(type = TYPES.ASSOCIATE_ALIAS) {
  return {
    decision_type: type,
    source_report_id: '11111111-1111-4111-8111-111111111111',
    source_ot: '24530',
    source_filename: '24530 INFORME.xlsx',
    evidence: {
      report_ids: ['11111111-1111-4111-8111-111111111111'],
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
  assert.deepEqual(validateDecision(input).aliases, ['BOMBA DE VACIO', 'BOMBA VACIO'])
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
test('rechaza evidencia sin contrato completo', () => rejects({ evidence: {} }, /report_ids requerido/))
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
test('rechaza alias y aliases simultáneos', () => rejects({
  decision_type: TYPES.CREATE_FAMILY, aliases: ['OTRO'],
}, /excluyentes/))
test('rechaza aliases vacío', () => {
  const input = base(TYPES.CREATE_FAMILY)
  delete input.alias
  input.aliases = []
  assert.throws(() => validateDecision(input), /vacío/)
})
test('rechaza created_at inválido', () => rejects({ created_at: 'ayer' }, /created_at inválido/))
test('rechaza source_report_id no UUID', () => rejects({ source_report_id: 'reporte-1' }, /UUID/))
test('rechaza propiedades desconocidas', () => rejects({ extra: true }, /desconocidas/))
test('rechaza propiedades desconocidas en evidencia', () => rejects({
  evidence: { ...base().evidence, score: 1 },
}, /propiedades desconocidas/))
test('rechaza evidence sin alguno de los tres arrays', () => {
  for (const field of ['report_ids', 'filenames', 'observations']) {
    const evidence = { ...base().evidence }
    delete evidence[field]
    assert.throws(() => validateDecision({ ...base(), evidence }), new RegExp(field))
  }
})
test('rechaza elementos no textuales o vacíos en evidence', () => {
  rejects({ evidence: { ...base().evidence, observations: [42] } }, /observations/)
  rejects({ evidence: { ...base().evidence, filenames: [' '] } }, /filenames/)
})
