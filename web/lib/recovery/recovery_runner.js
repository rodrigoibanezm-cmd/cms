import { parseModelJson } from '../../../benchmark/lib/io.js';
import { AUTO_RECOVERY_FIELD_SET } from '../audit/audit_fields.js';
import { callGemini } from '../benchmark/gemini_client.js';
import { buildRecoveryPrompt } from './recovery_prompt.js';

function filterAllowed(items) {
  return (items || []).filter((item) => AUTO_RECOVERY_FIELD_SET.has(String(item?.field || '')));
}

export async function runRecovery({ image, extraction, audit }) {
  const patches = filterAllowed(audit?.patches);
  if (audit?.decision !== 'recover' || audit?.internal_recovery !== 'recover_auto' || !patches.length) {
    console.log('[recovery] skipped', {
      ot: extraction?.ot,
      decision: audit?.decision,
      internal_recovery: audit?.internal_recovery,
      requested: audit?.patches?.map((item) => item.field) || [],
    });
    return null;
  }

  console.log('[recovery] start', { ot: extraction?.ot, fields: patches.map((item) => item.field) });
  const prompt = buildRecoveryPrompt({ extraction, patches });
  const raw = await callGemini({ model: 'gemini-2.5-pro', prompt, image });
  const parsed = parseModelJson(raw);
  const patch = parsed?.patch && typeof parsed.patch === 'object' ? parsed.patch : null;
  if (!patch || Array.isArray(patch)) {
    console.log('[recovery] no_patch', { ot: extraction?.ot });
    return null;
  }

  console.log('[recovery] patch', { ot: extraction?.ot, fields: Object.keys(patch) });
  return {
    patch,
    source_audit: audit,
  };
}
