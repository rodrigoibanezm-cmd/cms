import { isAutoRecoveryField } from './audit_fields.js';

export function parseAuditJson(raw) {
  try {
    return JSON.parse(String(raw).replace(/```json|```/g, '').trim());
  } catch {
    return {
      decision: 'review',
      internal_recovery: 'none',
      confidence: 0,
      issues: [{ field: 'auditor', severity: 'critical', reason: 'Respuesta no JSON.' }],
      recovery_targets: [],
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
      .filter(isAutoRecoveryField)
  );
}

function isLayoutPatch(patch) {
  const value = `${patch?.field || ''} ${patch?.instruction || ''}`.toLowerCase();
  return ['layout', 'celda', 'formato', 'posición', 'posicion', 'estética', 'estetica']
    .some((word) => value.includes(word));
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
      return isAutoRecoveryField(field)
        && hasCriticalIssueForPatch(field, issues)
        && patch?.instruction
        && !isLayoutPatch(patch);
    })
    : [];
}

function normalizeRecoveryTargets(audit, decision, patches) {
  if (decision !== 'recover') return [];
  const direct = Array.isArray(audit?.recovery_targets) ? audit.recovery_targets : [];
  const fromPatches = patches.map((patch) => patch.field);
  return [...new Set([...direct, ...fromPatches]
    .map((field) => String(field || '').trim())
    .filter(isAutoRecoveryField))];
}

function normalizeInternalRecovery(decision, recoveryTargets) {
  if (decision !== 'recover') return 'none';
  return recoveryTargets.length ? 'recover_auto' : 'recover_manual';
}

export function normalizeAudit(audit) {
  const decision = ['approve', 'recover', 'review'].includes(audit?.decision)
    ? audit.decision
    : 'review';
  const issues = Array.isArray(audit?.issues) ? audit.issues : [];
  const patches = normalizePatches(audit, decision, issues);
  const recovery_targets = normalizeRecoveryTargets(audit, decision, patches);
  const internal_recovery = normalizeInternalRecovery(decision, recovery_targets);
  return {
    decision,
    internal_recovery,
    confidence: Number(audit?.confidence || 0),
    issues,
    recovery_targets,
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
    recovery_targets: audit.recovery_targets || [],
    patches: audit.patches.map((patch) => patch.field),
    model: audit.model,
  });
}