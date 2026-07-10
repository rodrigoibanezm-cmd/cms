function text(value) {
  return String(value ?? '').trim();
}

function norm(value) {
  return text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, '');
}

function valueAtPath(source, path) {
  return String(path || '').split('.').reduce((current, key) => current?.[key], source);
}

function excelHasValue(excelView, expected) {
  const wanted = norm(expected);
  if (!wanted) return true;
  return (excelView?.cells || []).some((cell) => {
    const value = norm(cell?.value);
    return value === wanted || value.includes(wanted) || wanted.includes(value);
  });
}

function uniqueItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item?.field || item || '').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const FIELD_CHECKS = [
  {
    field: 'especificos.precision_cw',
    label: 'precisión CW',
    penalty: 3,
  },
  {
    field: 'especificos.precision_ccw',
    label: 'precisión CCW',
    penalty: 3,
  },
];

function missingExpectedFields({ extraction, excelView }) {
  return FIELD_CHECKS.filter((check) => {
    const expected = valueAtPath(extraction, check.field);
    return text(expected) && !excelHasValue(excelView, expected);
  });
}

export function applyDeterministicAuditChecks(audit, { extraction, excelView }) {
  const missing = missingExpectedFields({ extraction, excelView });
  if (!missing.length) return audit;

  const issues = [
    ...(audit?.issues || []),
    ...missing.map((check) => ({
      field: check.field,
      severity: 'minor',
      quality_penalty: check.penalty,
      reason: `La extracción trae ${check.label}, pero el valor no aparece en el Excel generado.`,
    })),
  ];
  const recovery_targets = uniqueItems([...(audit?.recovery_targets || []), ...missing.map((check) => check.field)]);

  return {
    ...audit,
    decision: audit?.decision === 'review' ? 'review' : 'recover',
    internal_recovery: recovery_targets.length ? 'recover_auto' : audit?.internal_recovery || 'none',
    confidence: Math.min(Number(audit?.confidence || 1), 0.97),
    issues: uniqueItems(issues),
    recovery_targets,
  };
}