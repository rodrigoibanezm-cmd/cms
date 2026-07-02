import { auditPatchFieldsText } from './audit_fields.js';

export function auditJsonSchemaText() {
  return JSON.stringify({
    decision: 'approve|recover|review',
    internal_recovery: 'none|recover_auto|recover_manual',
    confidence: 0,
    issues: [
      {
        field: 'free text allowed for human explanation',
        severity: 'critical|minor',
        reason: 'string',
      },
    ],
    patches: [
      {
        field: auditPatchFieldsText(),
        instruction: 'explicit machine-safe correction only',
      },
    ],
    repair_prompt: 'string|null',
  }, null, 2);
}
