const HASH = /^[0-9a-f]{64}$/
const CELL = /^[A-Z]{1,3}[1-9][0-9]*$/
const SOURCE = /^[a-z][a-z0-9_.]*$/

function object(value, field) {
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error(`${field} must be an object.`)
  return value
}
function exactKeys(value, allowed, field) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key))
  if (unknown.length) throw new Error(`${field} has unsupported field ${unknown.sort()[0]}.`)
  for (const key of allowed) if (value[key] === undefined) throw new Error(`${field} is missing ${key}.`)
}
function nonEmptyText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be non-empty text.`)
  return value.trim()
}

function classifier(value, family) {
  object(value, `${family}.classifier`)
  exactKeys(value, ['strategy', 'source_field'], `${family}.classifier`)
  if (value.strategy !== 'alias_exact') throw new Error(`${family}.classifier.strategy is unsupported.`)
  if (!SOURCE.test(nonEmptyText(value.source_field, `${family}.classifier.source_field`))) {
    throw new Error(`${family}.classifier.source_field is invalid.`)
  }
  return value
}
function template(value, family) {
  object(value, `${family}.template_reference`)
  exactKeys(value, ['filename', 'drive_file_id', 'sha256', 'size_bytes'], `${family}.template_reference`)
  nonEmptyText(value.filename, `${family}.template_reference.filename`)
  nonEmptyText(value.drive_file_id, `${family}.template_reference.drive_file_id`)
  if (!HASH.test(value.sha256)) throw new Error(`${family}.template_reference.sha256 is invalid.`)
  if (!Number.isSafeInteger(value.size_bytes) || value.size_bytes <= 0) {
    throw new Error(`${family}.template_reference.size_bytes is invalid.`)
  }
  return value
}
function mapping(value, family) {
  object(value, `${family}.render_mapping`)
  exactKeys(value, ['operations'], `${family}.render_mapping`)
  if (!Array.isArray(value.operations) || !value.operations.length) {
    throw new Error(`${family}.render_mapping.operations must be non-empty.`)
  }
  value.operations.forEach((operation, index) => {
    const field = `${family}.render_mapping.operations[${index}]`
    object(operation, field)
    exactKeys(operation, ['op', 'source', 'target'], field)
    if (operation.op !== 'set_cell') throw new Error(`${field}.op is unsupported.`)
    if (!SOURCE.test(nonEmptyText(operation.source, `${field}.source`))) throw new Error(`${field}.source is invalid.`)
    if (!CELL.test(nonEmptyText(operation.target, `${field}.target`))) throw new Error(`${field}.target is invalid.`)
  })
  return value
}
function metadata(value, family) {
  object(value, `${family}.render_metadata`)
  exactKeys(value, ['sheet_index', 'output_extension', 'mime_type'], `${family}.render_metadata`)
  if (!Number.isSafeInteger(value.sheet_index) || value.sheet_index < 0) throw new Error(`${family}.render_metadata.sheet_index is invalid.`)
  if (value.output_extension !== 'xlsx') throw new Error(`${family}.render_metadata.output_extension is unsupported.`)
  if (value.mime_type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    throw new Error(`${family}.render_metadata.mime_type is unsupported.`)
  }
  return value
}

function certifyFamily(family, aliases, source) {
  object(source, `Family ${family}`)
  exactKeys(source, ['classifier', 'template_reference', 'render_mapping', 'render_metadata'], `Family ${family}`)
  if (!Array.isArray(aliases) || !aliases.length) throw new Error(`Family ${family} is not executable. Missing aliases.`)
  return {
    aliases: [...aliases],
    classifier: classifier(source.classifier, family),
    template_reference: template(source.template_reference, family),
    render_mapping: mapping(source.render_mapping, family),
    render_metadata: metadata(source.render_metadata, family),
  }
}

module.exports = { certifyFamily }
