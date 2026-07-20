const test = require('node:test')
const assert = require('node:assert/strict')
const { TYPES } = require('../decisions/model')
const { compileCatalog } = require('./compiler')

const reportId = '11111111-1111-4111-8111-111111111111'
const snapshot = { aliases: { LUMINARIA: ['LUMINARIA'], TALADRO: ['TALADRO'] } }

function decision(type, extra = {}) {
  return {
    decision_type: type,
    source_report_id: reportId,
    source_ot: '24530',
    source_filename: '24530 INFORME.xlsx',
    evidence: { report_ids: [reportId], filenames: [], observations: ['evidencia'] },
    reason: 'evidencia suficiente',
    created_by: 'admin-1',
    created_at: '2026-07-20T12:00:00.000Z',
    ...extra,
  }
}

test('mismo contenido produce mismo artefacto y hash sin importar orden', () => {
  const create = decision(TYPES.CREATE_FAMILY, {
    target_family: 'bomba de vacío', aliases: ['Bomba vacío'],
  })
  const associate = decision(TYPES.ASSOCIATE_ALIAS, {
    source_ot: '24531', alias: 'Trípode', target_family: 'Luminaria',
  })
  const first = compileCatalog(snapshot, [create, associate])
  const second = compileCatalog(snapshot, [associate, create])
  assert.equal(first.serialized, second.serialized)
  assert.equal(first.hash, second.hash)
})

test('aplica creación y asociación sobre snapshot', () => {
  const result = compileCatalog(snapshot, [
    decision(TYPES.CREATE_FAMILY, { target_family: 'Bomba Vacío', alias: 'Bomba vacío' }),
    decision(TYPES.ASSOCIATE_ALIAS, { alias: 'Trípode', target_family: 'Luminaria' }),
  ])
  assert.deepEqual(result.artifact.aliases.BOMBA_VACIO, ['BOMBA VACIO'])
  assert.deepEqual(result.artifact.aliases.LUMINARIA, ['LUMINARIA', 'TRIPODE'])
})

test('rechazo no modifica el catálogo', () => {
  const reject = decision(TYPES.REJECT_INSUFFICIENT_EVIDENCE)
  assert.deepEqual(compileCatalog(snapshot, [reject]).artifact, compileCatalog(snapshot, []).artifact)
})

test('rechaza alias asociado a familias distintas', () => {
  assert.throws(() => compileCatalog(snapshot, [
    decision(TYPES.ASSOCIATE_ALIAS, { alias: 'Taladro', target_family: 'Luminaria' }),
  ]), /ya pertenece/)
})

test('rechaza familia inexistente en asociación', () => {
  assert.throws(() => compileCatalog(snapshot, [
    decision(TYPES.ASSOCIATE_ALIAS, { alias: 'Otro', target_family: 'Nueva' }),
  ]), /inexistente/)
})

test('no muta snapshot ni decisiones', () => {
  const input = decision(TYPES.ASSOCIATE_ALIAS, { alias: 'Trípode', target_family: 'Luminaria' })
  const beforeSnapshot = JSON.stringify(snapshot)
  const beforeInput = JSON.stringify(input)
  compileCatalog(snapshot, [input])
  assert.equal(JSON.stringify(snapshot), beforeSnapshot)
  assert.equal(JSON.stringify(input), beforeInput)
})
