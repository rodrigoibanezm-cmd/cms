import OpenAI from 'openai';
import { AUDIT_PATCH_FIELD_SET } from './audit_fields.js';
import { buildAuditPrompt } from './audit_prompt.js';
import { excelToAuditView } from './excel_audit_view.js';

function parseJson(raw) {
  try {
    return JSON.parse(String(raw).replace(/```json|```/g, '').trim());
  } catch {
    return {
      decision: 'review',
      internal_recovery: 'none',
      confidence: 0,
      issues: [{ field: 'auditor', severity: 'critical', reason: 'Respuesta no JSON.' }],
      patches: [],
      repair_prompt: null,
    };
  }
}

function criticalFieldSet(issues) {
  return new Set(
    (issues || [])
      .filter((issue) => issue?.severity === 'critical')
      .map((issue) => String(issue?.field || '').trim())
  );
}

function isLayoutPatch(patch) {
  const text = `${patch?.field || ''} ${patch?.instruction || ''}`.toLowerCase();
  return ['layout', 'celda', 'formato', 'posición', 'posicion', 'estética', 'estetica']
    .some((word) => text.includes(word));
}

function normalizePatches(audit, decision, issues) {
  if (decision !== 'recover') return [];
  const critical = criticalFieldSet(issues);
  return Array.isArray(audit?.patches)
    ? audit.patches.filter((patch) => {
      const field = String(patch?.field || '').trim();
      return AUDIT_PATCH_FIELD_SET.has(field)
        && critical.has(field)
        && patch?.instruction
        && !isLayoutPatch(patch);
    })
    : [];
}

function normalizeInternalRecovery(audit, decision, patches) {
  if (decision !== 'recover') return 'none';
  if (patches.length) return 'recover_auto';
  return audit?.internal_recovery === 'recover_manual' ? 'recover_manual' : 'recover_manual';
}

function normalizeAudit(audit) {
  const decision = ['approve', 'recover', 'review'].includes(audit?.decision)
    ? audit.decision
    : 'review';
  const issues = Array.isArray(audit?.issues) ? audit.issues : [];
  const patches = normalizePatches(audit, decision, issues);
  const internal_recovery = normalizeInternalRecovery(audit, decision, patches);
  return {
    decision,
    internal_recovery,
    confidence: Number(audit?.confidence || 0),
    issues,
    patches,
    repair_prompt: internal_recovery === 'recover_auto' ? audit?.repair_prompt || null : null,
  };
}

export async function auditReport({ reportImage, xlsBuffer, extraction }) {
  const model = process.env.OPENAI_AUDIT_MODEL;
  if (!model) throw new Error('Falta modelo de auditoría');

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
  const audit = normalizeAudit(parseJson(raw));
  audit.model = model;
  console.log('[audit] done', {
    ot: extraction?.ot,
    recovered: Boolean(extraction?.recovery?.applied),
    decision: audit.decision,
    internal_recovery: audit.internal_recovery,
    issues: audit.issues.length,
    patches: audit.patches.map((patch) => patch.field),
  });
  return audit;
}
