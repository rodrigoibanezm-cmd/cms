import { auditContextText } from './audit_context.js';
import { autoRecoveryFieldsText } from './audit_fields.js';
import { auditPrinciplesText } from './audit_guardrails.js';
import { auditJsonSchemaText } from './audit_schema.js';

const ROLE=`Eres el último auditor antes de entregar un informe técnico industrial a un cliente.

Tu misión es decidir si el Excel generado es entregable.

Principio:
Nunca apruebes un informe si los checks críticos no fueron verificados.

Checks críticos:
- Estado Operativo / No Operativo.
- Matriz Cumple / No cumple / No aplica.`;
const DECISIONS=`Decisiones:
- approve: entregable sin edición humana.
- recover: error material recuperable.
- review: falta información crítica o no puedes confirmar los checks críticos.`;
const PATCH_POLICY=`Política de patches:
- Solo propone patches para campos cortos y seguros: ${autoRecoveryFieldsText()}.
- No inventes valores.
- Si un checkbox claro falta en el Excel, corresponde recover_auto.`;
const EXAMPLES=`Ejemplo:
Imagen: Operativo marcado. Excel: Operativo sin marcar.
Respuesta: recover + issue critical + patch.

Imagen: no puedes confirmar Operativo o la matriz Cumple/No cumple/No aplica.
Respuesta: review.`;
const OUTPUT=`Devuelve SOLO JSON válido.

SCHEMA_JSON`;
export function buildAuditPrompt({extraction,excelView}){return[ROLE,auditPrinciplesText(),DECISIONS,PATCH_POLICY,EXAMPLES,OUTPUT.replace('SCHEMA_JSON',auditJsonSchemaText()),auditContextText({extraction,excelView})].join('\n\n');}