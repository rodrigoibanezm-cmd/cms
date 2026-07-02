import OpenAI from 'openai';
import { buildAuditPrompt } from './audit_prompt.js';
import { excelToAuditView } from './excel_audit_view.js';

function parseJson(raw) {
  try {
    return JSON.parse(String(raw).replace(/```json|```/g, '').trim());
  } catch {
    return {
      decision: 'review',
      confidence: 0,
      issues: [{ field: 'auditor', severity: 'critical', reason: 'Respuesta no JSON.' }],
      repair_prompt: null,
    };
  }
}

function normalizeAudit(audit) {
  const decision = ['approve', 'recover', 'review'].includes(audit?.decision)
    ? audit.decision
    : 'review';
  return {
    decision,
    confidence: Number(audit?.confidence || 0),
    issues: Array.isArray(audit?.issues) ? audit.issues : [],
    repair_prompt: decision === 'recover' ? audit?.repair_prompt || null : null,
  };
}

export async function auditReport({ reportImage, xlsBuffer, extraction }) {
  const model = process.env.OPENAI_AUDIT_MODEL || 'gpt-5.5';
  const client = new OpenAI();
  const excelView = await excelToAuditView(xlsBuffer);
  const prompt = buildAuditPrompt({ extraction, excelView });

  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${reportImage.mediaType || 'image/jpeg'};base64,${reportImage.base64}`,
            },
          },
        ],
      },
    ],
  });

  const raw = response.choices?.[0]?.message?.content || '';
  const audit = normalizeAudit(parseJson(raw));
  audit.model = model;
  return audit;
}
