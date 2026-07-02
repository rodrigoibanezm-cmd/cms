import { auditPatchFieldsText } from './audit_fields.js';

export function auditJsonSchemaText() {
  const fields = auditPatchFieldsText();
  return JSON.stringify({
    decision: 'approve|recover|review',
    internal_recovery: 'none|recover_auto|recover_manual',
    confidence: 0,
    issues: [
      {
        field: 'field or human label',
        severity: 'critical|minor',
        reason: 'string',
      },
    ],
    recovery_targets: [fields],
    patches: [
      {
        field: fields,
        instruction: 'short safe correction only',
      },
    ],
    repair_prompt: 'string|null',
  }, null, 2);
}
