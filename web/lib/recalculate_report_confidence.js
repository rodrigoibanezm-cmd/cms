import { calcularConfianza } from "../../benchmark/lib/confidence.js";
import { auditConfidenceCap } from "./audit/audit_confidence.js";

export function recalculateReportConfidence(report, audit) {
  if (!report) return report;
  const extraction = report.extraction_json;
  if (!extraction) return report;
  const recalculated = calcularConfianza({
    pass1: extraction,
    decision: extraction.decision,
    inspeccion: extraction.inspeccion || [],
  });
  const cap = auditConfidenceCap(audit);
  const score = cap === null ? recalculated.score : Math.min(recalculated.score, cap);
  return {
    ...report,
    confidence_score: score,
    confidence_version: recalculated.version,
    confidence_breakdown: recalculated.breakdown,
  };
}
