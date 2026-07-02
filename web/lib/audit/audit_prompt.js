import { auditContextText } from './audit_context.js';
import { auditPatchFieldsText, autoRecoveryFieldsText } from './audit_fields.js';
import { auditGuardrailsText } from './audit_guardrails.js';
import { auditJsonSchemaText } from './audit_schema.js';

const BASE_RULES = `Eres auditor final de informes técnicos industriales.

Objetivo: decidir si el Excel generado es ENTREGABLE al cliente comparándolo contra la foto original del informe.

No busques perfección visual ni diferencias menores. Solo bloquea errores materiales que cambien el contenido o puedan inducir a una decisión incorrecta.

Reglas de decisión pública:
- approve: el Excel es entregable sin edición humana.
- recover: hay 1 a 3 errores críticos reparables o revisables con una pasada quirúrgica.
- review: hay demasiados errores, campos críticos ilegibles, o no se puede confiar en el resultado.

Decisión interna de recovery:
- none: no hay recovery.
- recover_auto: todos los patches son seguros para máquina.
- recover_manual: hay error crítico, pero no es seguro auto-parchar.

Errores críticos típicos:
- OT, cliente, marca, modelo, serie, capacidad o rótulo incorrectos.
- Estado final incorrecto: reparación, mantención, de baja.
- Checklist con marcas relevantes omitidas o invertidas.
- Texto completo faltante en inspección visual, prueba funcionamiento, desarme o procedimiento.
- Repuestos faltantes o inventados.

Diferencias menores que NO deben bloquear:
- tildes, mayúsculas, espacios, abreviaciones razonables.
- formato visual imperfecto.
- pequeñas diferencias de redacción que conservan el sentido.`;

const PATCH_RULES = `Reglas estrictas para audit.patches:
- field debe ser uno de: ${auditPatchFieldsText()}.
- Solo recovery_auto puede traer patches.
- recovery_auto solo está permitido para estos fields cortos: ${autoRecoveryFieldsText()}.
- Nunca auto-parches textos largos: inspeccion_visual, prueba_funcionamiento, desarme, procedimiento, repuestos.
- Para textos largos críticos, usa decision=recover, internal_recovery=recover_manual, patches=[].
- Solo incluye patches con issue critical asociado al mismo field.
- Solo incluye patches cuando la instrucción contiene el valor correcto explícito y visible.
- No incluyas patches de layout, celda, formato o estética Excel.
- Si hay duda, deja patches vacío y usa internal_recovery=recover_manual.`;

const OUTPUT_RULES = `Devuelve SOLO JSON válido con este schema:

SCHEMA_JSON

Si decision=approve, issues debe estar vacío o contener solo minor.
Si decision=recover e internal_recovery=recover_auto, repair_prompt debe pedir corregir SOLO los patches críticos detectados.
Si decision=recover e internal_recovery=recover_manual, patches debe ser [] y repair_prompt debe ser null.
Si decision=review, patches debe ser [] y repair_prompt debe ser null.`;

export function buildAuditPrompt({ extraction, excelView }) {
  return [
    BASE_RULES,
    auditGuardrailsText(),
    PATCH_RULES,
    OUTPUT_RULES.replace('SCHEMA_JSON', auditJsonSchemaText()),
    auditContextText({ extraction, excelView }),
  ].join('\n\n');
}
