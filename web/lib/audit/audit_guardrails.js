export const AUDIT_PRINCIPLES = [
  'Protege al cliente de errores materiales, no busques perfección.',
  'Si una lectura es dudosa, no inventes el valor correcto.',
  'issues explica el problema para una persona.',
  'patches corrige solo campos cortos, claros y seguros para máquina.',
  'Los textos largos se auditan, pero normalmente no se reescriben automáticamente.',
  'Un Excel visualmente imperfecto puede ser entregable si conserva el contenido técnico.',
];

export function auditPrinciplesText() {
  return ['Principios:', ...AUDIT_PRINCIPLES.map((rule) => `- ${rule}`)].join('\n');
}
