import { AUTO_RECOVERY_FIELD_SET } from './audit_fields.js';

export function parseAuditJson(raw) {
  try {
    return JSON.parse(String(raw).replace(/```json|```/g, '').trim());
  } catch {
    return {
      decision: 'review',
      internal_recovery: 'none',
      confidence: 0,
      issues: [{ field: 'auditor', severity: 'critical', reason: 'Respuesta no JSON.' }],
      patches: [],
      repair_prompt: null,
    };
  }
}

function criticalIssues(issues) {
  return (issues || []).filter((issue) => issue?.severity === 'critical');
}

function criticalAutoFieldSet(issues) {
  return new Set(
    criticalIssues(issues)
      .map((issue) => String(issue?.field || '').trim())
      .filter((field) => AUTO_RECOVERY_FIELD_SET.has(field))
  );
}

function isLayoutPatch(patch) {
  const text = `${patch?.field || ''} ${patch?.instruction || ''}`.toLowerCase();
  return ['layout', 'celda', 'formato', 'posición', 'posicion', 'estética', 'estetica']
    .some((word) => text.includes(word));
}

function hasCriticalIssueForPatch(field, issues) {
  const fields = criticalAutoFieldSet(issues);
  if (fields.size > 0) return fields.has(field);
  return criticalIssues(issues).length > 0;
}

function normalizePatches(audit, decision, issues) {
  if (decision !== 'recover') return [];
  return Array.isArray(audit?.patches)
    ? audit.patches.filter((patch) => {
      const field = String(patch?.field || '').trim();
      return AUTO_RECOVERY_FIELD_SET.has(field)
        && hasCriticalIssueForPatch(field, issues)
        && patch?.instruction
        && !isLayoutPatch(patch);
    })
    : [];
}

function normalizeInternalRecovery(decision, patches) {
  if (decision !== 'recover') return 'none';
  return patches.length ? 'recover_auto' : 'recover_manual';
}

export function normalizeAudit(audit) {
  const decision = ['approve', 'recover', 'review'].includes(audit?.decision)
    ? audit.decision
    : 'review';
  const issues = Array.isArray(audit?.issues) ? audit.issues : [];
  const patches = normalizePatches(audit, decision, issues);
  const internal_recovery = normalizeInternalRecovery(decision, patches);
  return {
    decision,
    internal_recovery,
    confidence: Number(audit?.confidence || 0),
    issues,
    patches,
    repair_prompt: internal_recovery === 'recover_auto' ? audit?.repair_prompt || null : null,
  };
}

export function logAuditDone({ audit, extraction }) {
  console.log('[audit] done', {
    ot: extraction?.ot,
    recovered: Boolean(extraction?.recovery?.applied),
    decision: audit.decision,
    internal_recovery: audit.internal_recovery,
    issues: audit.issues.length,
    patches: audit.patches.map((patch) => patch.field),
    model: audit.model,
  });
}
