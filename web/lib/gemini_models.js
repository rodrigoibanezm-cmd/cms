export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

const STAGE_DEFAULTS = {
  GEMINI_EXTRACT_MODEL: 'gemini-3.1-flash-lite',
  GEMINI_EXTRACT_DETAIL_MODEL: 'gemini-3.5-flash',
  GEMINI_AUDIT_MODEL: 'gemini-3.5-flash',
  GEMINI_RECOVERY_MODEL: 'gemini-3.5-flash',
  GEMINI_OPTION_MODEL: 'gemini-3.5-flash',
  GEMINI_FINAL_PROPOSAL_MODEL: 'gemini-3.5-flash',
};

const RETIRED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
]);

function usable(model) {
  const value = String(model || '').trim();
  return value && !RETIRED_MODELS.has(value) ? value : null;
}

export function geminiModel(envName) {
  return usable(process.env[envName])
    || usable(process.env.GEMINI_MODEL)
    || STAGE_DEFAULTS[envName]
    || DEFAULT_GEMINI_MODEL;
}

export function resolveGeminiModel(model) {
  return usable(model) || DEFAULT_GEMINI_MODEL;
}
