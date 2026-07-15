import { callGemini } from '../benchmark/gemini_client.js';
import { geminiModel } from '../gemini_models.js';
import { parseModelJson } from '../../../benchmark/lib/io.js';
import { proposalFields, proposalPrompt } from './prompt.js';

export function cleanProposal(value = {}) {
  return Object.fromEntries(proposalFields().map((field) => {
    const text = String(value[field] ?? '').trim();
    return [field, text || null];
  }));
}

export async function generateProposal(xlsText) {
  const raw = await callGemini({
    model: geminiModel('GEMINI_FINAL_PROPOSAL_MODEL'),
    prompt: proposalPrompt(xlsText),
  });
  const parsed = parseModelJson(raw);
  if (parsed._parse_error) throw new Error('La IA no devolvió una propuesta válida');
  return cleanProposal(parsed);
}
