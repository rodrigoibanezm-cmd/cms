import { auditContextText } from './audit_context.js';
import { auditJsonSchemaText } from './audit_schema.js';

const BASE_RULES = `Eres auditor final de informes técnicos industriales.

Objetivo: decidir si el Excel generado es ENTREGABLE al cliente comparándolo contra la foto original del informe.

No busques perfección visual ni diferencias menores. Solo bloquea errores materiales que cambien el contenido o puedan inducir a una decisión incorrecta.

Reglas de decisión:
- approve: el Excel es entregable sin edición humana.
- recover: hay 1 a 3 errores críticos y reparables con una pasada quirúrgica.
- review: hay demasiados errores, campos críticos ilegibles, o no se puede confiar en el resultado.

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

const OUTPUT_RULES = `Devuelve SOLO JSON válido con este schema:

SCHEMA_JSON

Si decision=approve, issues debe estar vacío o contener solo minor.
Si decision=recover, repair_prompt debe pedir corregir SOLO los campos críticos detectados. Prohibido pedir reextraer todo el informe.
Si decision=review, repair_prompt debe ser null.`;

export function buildAuditPrompt({ extraction, excelView }) {
  return [
    BASE_RULES,
    OUTPUT_RULES.replace('SCHEMA_JSON', auditJsonSchemaText()),
    auditContextText({ extraction, excelView }),
  ].join('\n\n');
}
