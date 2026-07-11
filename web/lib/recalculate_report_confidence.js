import { auditConfidenceCap } from "./audit/audit_confidence.js";

export function recalculateReportConfidence(report, audit) {
  if (!report) return report;
  const extracted = Number(report.extraction_json?.confidence_score);
  const stored = Number(report.confidence_score);
  const base = Number.isFinite(extracted) ? extracted : stored;
  const cap = auditConfidenceCap(audit);
  const score = cap === null ? base : Math.min(Number.isFinite(base) ? base : 100, cap);
  return {
    ...report,
    confidence_score: score,
    confidence_version: "confidence-v1",
  };
}
