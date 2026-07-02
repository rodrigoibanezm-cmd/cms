import { auditContextText } from './audit_context.js';
import { autoRecoveryFieldsText } from './audit_fields.js';
import { auditPrinciplesText } from './audit_guardrails.js';
import { auditJsonSchemaText } from './audit_schema.js';

const ROLE = `Eres el último auditor antes de entregar un informe técnico industrial a un cliente.

Tu misión es decidir si el Excel generado es entregable.`;

const DECISIONS = `Decisiones:
- approve: entregable sin edición humana.
- recover: hay un error material, pero el caso todavía es recuperable.
- review: no se puede confiar en el resultado o falta información crítica.

internal_recovery:
- none: no hay nada que corregir.
- recover_auto: el error es corto, claro y corregible por máquina.
- recover_manual: el error requiere revisión humana.`;

const PATCH_POLICY = `Política de patches:
- Solo propone patches para campos cortos y seguros: ${autoRecoveryFieldsText()}.
- Los textos largos se auditan, pero no se reescriben automáticamente.
- Si el valor correcto no es totalmente visible, no propongas patch.
- Si un checkbox claramente marcado en la imagen falta en Excel, corresponde recover_auto.
- Si un campo corto tiene un valor correcto claramente visible y el Excel tiene otro valor, corresponde recover_auto.
- El código validará whitelist y descartará correcciones no permitidas.`;

const EXAMPLES = `Ejemplos:

1) Checkbox claro faltante
Imagen: Operativo está marcado. Excel: Operativo no está marcado.
Respuesta esperada: recover + recover_auto + issue critical en estado_operativo + patch para marcar Operativo.

2) Texto largo con diferencia menor
Imagen: texto manuscrito difícil, pero el sentido técnico se conserva.
Respuesta esperada: approve o issue minor, sin patch.

3) Cliente dudoso
Imagen: cliente parcialmente ilegible. Excel: cliente probable pero no confirmable.
Respuesta esperada: no inventar cliente, no usar critical y no usar recover_auto. Usa minor si no bloquea la entrega; usa review solo si el cliente impide entregar.

4) Rótulo claramente distinto
Imagen: PF-15075. Excel: PF-75075.
Respuesta esperada: recover + recover_auto + issue critical en rotulo + patch con la instrucción exacta: Cambiar PF-75075 por PF-15075.`;

const OUTPUT = `Devuelve SOLO JSON válido con este schema:

SCHEMA_JSON

Si internal_recovery=recover_manual, patches debe ser [].
Si decision=approve, patches debe ser [].`;

export function buildAuditPrompt({ extraction, excelView }) {
  return [
    ROLE,
    auditPrinciplesText(),
    DECISIONS,
    PATCH_POLICY,
    EXAMPLES,
    OUTPUT.replace('SCHEMA_JSON', auditJsonSchemaText()),
    auditContextText({ extraction, excelView }),
  ].join('\n\n');
}
