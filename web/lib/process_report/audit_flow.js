import { auditWithGemini } from '../audit/gemini_auditor.js';
import { mergeRecoveryPatch } from '../recovery/merge_patch.js';
import { runRecovery } from '../recovery/recovery_runner.js';
import { generateFinalXls } from '../xls_generator.js';
import { markExtracted } from '../report_updates.js';

function isJsonPatchField(field) {
  const value = String(field || '');
  return Boolean(value) && !value.includes(' ') && !value.includes('-');
}

function hasRecoveryTarget(audit) {
  const targets = audit?.recovery_targets || [];
  const patches = audit?.patches || [];
  return targets.some(isJsonPatchField) || patches.some((patch) => isJsonPatchField(patch?.field));
}

async function runAuditor({ reportImage, xls, extraction }) {
  return auditWithGemini({ reportImage, xlsBuffer: xls.buffer, extraction });
}

export async function generateAndAudit({ reportImage, extraction, photoPayload }) {
  const xls = await generateFinalXls({ extraction, photos: photoPayload, publish: false });
  const audit = await runAuditor({ reportImage, xls, extraction });
  return { xls, audit };
}

export async function maybeRecover({ reportId, reportImage, extraction, photoPayload, audit }) {
  if (!hasRecoveryTarget(audit)) return null;

  const recovery = await runRecovery({ image: reportImage, extraction, audit });
  if (!recovery?.patch) return null;

  const recoveredExtraction = mergeRecoveryPatch(extraction, recovery.patch);
  await markExtracted(reportId, recoveredExtraction);
  const result = await generateAndAudit({
    reportImage,
    extraction: recoveredExtraction,
    photoPayload,
  });

  return { ...result, extraction: recoveredExtraction, recovery };
}
