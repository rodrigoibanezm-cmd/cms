import { callGemini } from '../benchmark/gemini_client.js';
import { parseModelJson } from '../../../benchmark/lib/io.js';
import { buildRecoveryPrompt } from './recovery_prompt.js';

export async function runRecovery({ image, extraction, audit }) {
  const patches = audit?.patches || [];
  if (audit?.decision !== 'recover' || !patches.length) return null;

  const prompt = buildRecoveryPrompt({ extraction, patches });
  const raw = await callGemini({ model: 'gemini-2.5-pro', prompt, image });
  const parsed = parseModelJson(raw);
  const patch = parsed?.patch && typeof parsed.patch === 'object' ? parsed.patch : null;
  if (!patch || Array.isArray(patch)) return null;

  return {
    patch,
    source_audit: audit,
  };
}
