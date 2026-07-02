import OpenAI from 'openai';
import { buildAuditPrompt } from './audit_prompt.js';
import { excelToAuditView } from './excel_audit_view.js';
import { logAuditDone, normalizeAudit, parseAuditJson } from './audit_normalizer.js';

export async function auditWithOpenAI({ reportImage, xlsBuffer, extraction }) {
  const model = process.env.OPENAI_AUDIT_MODEL;
  if (!model) throw new Error('Falta OPENAI_AUDIT_MODEL');

  const client = new OpenAI();
  const excelView = await excelToAuditView(xlsBuffer);
  const prompt = buildAuditPrompt({ extraction, excelView });

  const response = await client.chat.completions.create({
    model,
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
  const audit = normalizeAudit(parseAuditJson(raw));
  audit.model = model;
  logAuditDone({ audit, extraction });
  return audit;
}

export const auditReport = auditWithOpenAI;
