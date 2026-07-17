import { callGemini } from '../benchmark/gemini_client.js';
import { geminiModel } from '../gemini_models.js';
import { proposalFields, proposalPrompt } from './prompt.js';

function validateProposal(raw) {
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('Gemini no devolvió JSON válido y exclusivo');
  }
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error('La propuesta de Gemini no es un objeto JSON');
  }
  const expected = proposalFields();
  const keys = Object.keys(value);
  if (keys.length !== expected.length || keys.some((key) => !expected.includes(key))) {
    throw new Error('La propuesta de Gemini contiene claves inválidas');
  }
  if (expected.some((key) => !Object.hasOwn(value, key))) {
    throw new Error('La propuesta de Gemini está incompleta');
  }
  if (expected.some((key) => typeof value[key] !== 'string')) {
    throw new Error('Los bloques de la propuesta deben ser texto');
  }
  return Object.fromEntries(expected.map((key) => [key, value[key].trim()]));
}

export async function generateProposal(xlsText) {
  const model = geminiModel('GEMINI_FINAL_PROPOSAL_MODEL');
  const raw = await callGemini({ model, prompt: proposalPrompt(xlsText) });
  return { proposal: validateProposal(raw), model };
}
