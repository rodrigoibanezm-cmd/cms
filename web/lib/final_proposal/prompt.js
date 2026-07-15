const FIELDS = [
  'inspeccion_visual',
  'prueba_funcionamiento',
  'desarme',
  'reparacion',
  'recomendaciones',
];

export function proposalFields() {
  return FIELDS;
}

export function proposalPrompt(xlsText) {
  return `Eres redactor de informes técnicos de herramientas industriales.
La única fuente oficial es el contenido del XLS aprobado incluido abajo.
No uses conocimiento de conversaciones previas ni inventes hechos, fallas, repuestos o pruebas.
Interpreta el conjunto completo: encabezados, checks, observaciones, reparaciones y textos.
Redacta una propuesta técnica clara, breve y profesional; no te limites a copiar frases.
Si DESARME no aplica o no está sustentado, devuelve null.
RECOMENDACIONES debe derivarse solo de lo que el XLS permite concluir.

Devuelve SOLO JSON válido con estas claves:
${FIELDS.map((field) => `"${field}": "texto o null"`).join(',\n')}

CONTENIDO XLS APROBADO:
${xlsText}`;
}
