export function auditJsonSchemaText() {
  return JSON.stringify({
    decision: 'approve|recover|review',
    confidence: 0,
    issues: [
      {
        field: 'string',
        severity: 'critical|minor',
        reason: 'string',
      },
    ],
    repair_prompt: 'string|null',
  }, null, 2);
}
