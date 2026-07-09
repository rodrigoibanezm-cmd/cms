import { callGemini } from '../benchmark/gemini_client.js';
import { geminiModel } from '../gemini_models.js';
import { buildAuditPrompt } from './audit_prompt.js';
import { excelToAuditView } from './excel_audit_view.js';
import { logAuditDone, normalizeAudit, parseAuditJson } from './audit_normalizer.js';

export async function auditWithGemini({ reportImage, xlsBuffer, extraction }) {
  const model = geminiModel('GEMINI_AUDIT_MODEL');
  const excelView = await excelToAuditView(xlsBuffer);
  const prompt = buildAuditPrompt({ extraction, excelView });
  const raw = await callGemini({ model, prompt, image: reportImage });
  const audit = normalizeAudit(parseAuditJson(raw));
  audit.model = model;
  logAuditDone({ audit, extraction });
  return audit;
}
