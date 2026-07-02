export const AUDIT_GUARDRAILS = [
  'Reporta un error solo si el campo aparece claramente en la foto original o en la extracción.',
  'No marques como error un dato que la plantilla no tenga dónde representar.',
  'No marques como error ortografía propia de la plantilla, por ejemplo PRICIPAL versus PRINCIPAL.',
  'Si el contenido está correcto pero el layout es imperfecto, clasifícalo como minor.',
  'audit.issues es para explicación humana y puede usar nombres libres.',
  'audit.patches es para máquina: usa solo field cerrado de la whitelist.',
  'No propongas patch si no puedes mapearlo a un field cerrado.',
  'No propongas patch si el valor correcto no es explícito y visible.',
  'No propongas patch para layout, posición, celda, formato o estética Excel.',
];

export function auditGuardrailsText() {
  return ['Reglas para evitar hallazgos inválidos:', ...AUDIT_GUARDRAILS.map((rule) => `- ${rule}`)].join('\n');
}
