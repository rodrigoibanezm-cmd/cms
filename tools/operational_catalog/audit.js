function auditEvent({ decisionId, type, success, details = {} }) {
  if (!decisionId) throw new Error('decisionId is required')
  if (!type) throw new Error('type is required')

  return {
    decision_id: decisionId,
    event_type: type,
    success: Boolean(success),
    details,
    created_at: new Date().toISOString(),
  }
}

function compilationAudit(decisionId, result) {
  return auditEvent({
    decisionId,
    type: 'CATALOG_COMPILED',
    success: result.ok,
    details: result.ok
      ? {
          changed: result.changed,
          version: result.version,
          previous_version: result.previous_version || null,
          artifacts_hash: result.artifacts_hash || null,
          reprocess_ot: result.reprocess_ot,
        }
      : { errors: result.errors },
  })
}

module.exports = { auditEvent, compilationAudit }
