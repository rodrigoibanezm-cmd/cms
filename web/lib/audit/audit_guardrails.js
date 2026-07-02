export const AUDIT_PRINCIPLES = [
  'Protege al cliente de errores materiales, no busques perfección.',
  'El auditor diagnostica dónde releer, no reextrae todo el informe.',
  'Cada issue debe indicar qué debe mirar el admin o la relectura quirúrgica.',
  'Si una lectura es dudosa, no inventes el valor correcto.',
  'Los textos largos se auditan, pero normalmente quedan para admin.',
  'Un Excel visualmente imperfecto puede ser entregable si conserva el contenido técnico.',
  'Operativo/No Operativo y la matriz Cumple/No cumple/No aplica son zonas críticas.',
  'Si un check crítico claro falta, cambia o queda vacío, el issue debe ser critical.',
  'Si no puedes aislar pocos campos seguros para recovery, la decisión debe ser review.',
];

export function auditPrinciplesText() {
  return ['Principios:', ...AUDIT_PRINCIPLES.map((rule) => `- ${rule}`)].join('\n');
}
