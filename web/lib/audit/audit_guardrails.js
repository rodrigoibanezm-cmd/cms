export const AUDIT_PRINCIPLES = [
  'Protege al cliente de errores materiales, no busques perfección.',
  'Si una lectura es dudosa, no inventes el valor correcto.',
  'issues explica el problema para una persona.',
  'patches corrige solo campos cortos, claros y seguros para máquina.',
  'Los textos largos se auditan, pero normalmente no se reescriben automáticamente.',
  'Un Excel visualmente imperfecto puede ser entregable si conserva el contenido técnico.',
  'El estado Operativo o No Operativo debe ser revisado contra la imagen original.',
  'Los checks Cumple, No cumple y No aplica deben ser revisados contra la imagen original.',
  'Si un check crítico claro falta o cambia en el Excel, el issue debe ser critical.',
  'Si no puedes confirmar estado o checks críticos, la decisión debe ser review.',
];

export function auditPrinciplesText() {
  return ['Principios:', ...AUDIT_PRINCIPLES.map((rule) => `- ${rule}`)].join('\n');
}
