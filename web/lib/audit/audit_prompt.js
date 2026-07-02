import { auditContextText } from './audit_context.js';
import { autoRecoveryFieldsText } from './audit_fields.js';
import { auditPrinciplesText } from './audit_guardrails.js';
import { auditJsonSchemaText } from './audit_schema.js';

const ROLE = `Eres el auditor diagnóstico de un informe técnico industrial.

Tu misión no es perfeccionar ni reescribir el informe.
Tu misión es decidir si el Excel generado es entregable o si conviene hacer una relectura quirúrgica de pocos campos.`;

const DECISIONS = `Decisiones:
- approve: entregable sin edición humana.
- recover: hay pocos campos claros que pueden releerse quirúrgicamente desde la imagen.
- review: requiere revisión humana del admin o no puedes aislar campos seguros.`;

const RECOVERY = `Relectura quirúrgica:
Si el problema está en campos cortos y visibles, devuelve recovery_targets usando solo:
${autoRecoveryFieldsText()}

No intentes reparar textos largos ni rehacer todo el informe.
No propongas patches salvo que la corrección sea obvia, corta y segura.
Si el problema es de layout, tabla incompleta, template raro o muchas marcas dudosas, manda review.`;

const EXAMPLE = `Ejemplo:
Imagen: Operativo marcado. Excel: Operativo vacío.
Respuesta: decision recover, issue critical, recovery_targets ["estado_operativo"].

Imagen: varias filas del checklist no coinciden y no puedes aislar el error.
Respuesta: decision review, issue critical, recovery_targets [].`;

const OUTPUT = `Devuelve SOLO JSON válido.

SCHEMA_JSON`;

export function buildAuditPrompt({ extraction, excelView }) {
  return [
    ROLE,
    auditPrinciplesText(),
    DECISIONS,
    RECOVERY,
    EXAMPLE,
    OUTPUT.replace('SCHEMA_JSON', auditJsonSchemaText()),
    auditContextText({ extraction, excelView }),
  ].join('\n\n');
}
