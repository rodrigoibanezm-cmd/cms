export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

const RETIRED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
]);

export function geminiModel(envName) {
  return process.env[envName] || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

export function resolveGeminiModel(model) {
  const requested = String(model || '').trim();
  if (!requested || RETIRED_MODELS.has(requested)) return geminiModel('GEMINI_MODEL');
  return requested;
}
