export function auditIssues(audit) {
  const recoveryIssues = audit?.recovery_review_issues || [];
  return recoveryIssues.length ? recoveryIssues : audit?.issues || [];
}

export function confidenceText(report) {
  if (!report || report.confidence_score === null || report.confidence_score === undefined) {
    return 'Calidad XLS: -';
  }
  return `Calidad XLS: ${report.confidence_score}%`;
}

export function guidanceText(audit) {
  if (audit?.recovery_applied) {
    return 'La IA aplico recovery automatico. Revisar estos campos porque ahi hubo duda durante la generacion.';
  }
  return 'Puntos detectados por el auditor para revisar contra el XLS final.';
}
