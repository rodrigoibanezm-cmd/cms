import { CONFIDENCE_ALGORITHM } from "../../benchmark/lib/confidence_config.js";

function isSimpleAutoRecovery(audit) {
  const issues = Array.isArray(audit?.issues) ? audit.issues : [];
  const targets = Array.isArray(audit?.recovery_targets) ? audit.recovery_targets : [];
  return audit?.decision === "recover" && issues.length === 1 && targets.length === 1;
}

function issuePenalty(issue, audit) {
  const explicit = Number(issue?.quality_penalty);
  if (Number.isFinite(explicit) && explicit >= 0) return explicit;
  const weights = CONFIDENCE_ALGORITHM.auditWeights;
  if (isSimpleAutoRecovery(audit)) return weights.simple_auto_recovery;
  const severity = String(issue?.severity || "").toLowerCase();
  if (["critical", "fatal", "blocker"].includes(severity)) return weights.critical;
  if (["high", "major"].includes(severity)) return weights.high;
  if (["medium", "warning", "review"].includes(severity)) return weights.medium;
  return weights.low;
}

export function auditConfidenceCap(audit) {
  const issues = Array.isArray(audit?.issues) ? audit.issues : [];
  if (!issues.length && audit?.decision === "approve") return null;
  const penalty = issues.reduce((sum, issue) => sum + issuePenalty(issue, audit), 0);
  const issueCap = issues.length ? Math.max(45, Math.round(100 - penalty)) : null;
  if (audit?.decision === "recover") return issueCap ?? 97;
  if (audit?.decision === "review") return issueCap ?? 90;
  return issueCap;
}
