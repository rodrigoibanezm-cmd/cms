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

Si el checklist está vacío o faltan marcas claras, usa recovery_targets ["inspeccion"].
Si el problema es amplio o dudoso, manda review.
No reescribas textos largos ni rehagas todo el informe.`;

const EXAMPLE = `Ejemplo:
Imagen: Operativo marcado. Excel: Operativo vacío.
Respuesta: decision recover, issue critical, recovery_targets ["estado_operativo"].

Imagen: checklist visible en la imagen, pero vacío en Excel.
Respuesta: decision recover, issue critical, recovery_targets ["inspeccion"].

Imagen: muchas marcas dudosas y no puedes aislar el error.
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
