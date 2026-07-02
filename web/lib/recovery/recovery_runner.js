import { parseModelJson } from '../../../benchmark/lib/io.js';
import { AUTO_RECOVERY_FIELD_SET } from '../audit/audit_fields.js';
import { callGemini } from '../benchmark/gemini_client.js';
import { buildRecoveryPrompt } from './recovery_prompt.js';

function filterTargets(items) {
  return [...new Set((items || [])
    .map((item) => String(item?.field || item || '').trim())
    .filter((field) => AUTO_RECOVERY_FIELD_SET.has(field)))];
}

export async function runRecovery({ image, extraction, audit }) {
  const targets = filterTargets(audit?.recovery_targets?.length ? audit.recovery_targets : audit?.patches);
  if (audit?.decision !== 'recover' || audit?.internal_recovery !== 'recover_auto' || !targets.length) {
    console.log('[recovery] skipped', {
      ot: extraction?.ot,
      decision: audit?.decision,
      internal_recovery: audit?.internal_recovery,
      requested: targets,
    });
    return null;
  }

  console.log('[recovery] start', { ot: extraction?.ot, fields: targets });
  const prompt = buildRecoveryPrompt({ extraction, targets, audit });
  const raw = await callGemini({ model: 'gemini-2.5-pro', prompt, image });
  const parsed = parseModelJson(raw);
  const patch = parsed?.patch && typeof parsed.patch === 'object' ? parsed.patch : null;
  if (!patch || Array.isArray(patch)) {
    console.log('[recovery] no_patch', { ot: extraction?.ot });
    return null;
  }

  const safePatch = Object.fromEntries(Object.entries(patch).filter(([field]) => targets.includes(field)));
  if (!Object.keys(safePatch).length) return null;

  console.log('[recovery] patch', { ot: extraction?.ot, fields: Object.keys(safePatch) });
  return {
    patch: safePatch,
    targets,
    source_audit: audit,
  };
}
