export const AUDIT_GUARDRAILS = [
  'Reporta un error solo si el campo aparece claramente en la foto original o en la extracción.',
  'No marques como error un dato que la plantilla no tenga dónde representar.',
  'No marques como error ortografía propia de la plantilla, por ejemplo PRICIPAL versus PRINCIPAL.',
  'Si el contenido está correcto pero el layout es imperfecto, clasifícalo como minor.',
];

export function auditGuardrailsText() {
  return ['Reglas para evitar hallazgos inválidos:', ...AUDIT_GUARDRAILS.map((rule) => `- ${rule}`)].join('\n');
}
