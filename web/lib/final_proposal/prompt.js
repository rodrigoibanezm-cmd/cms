const FIELDS = [
  'inspeccion_visual',
  'prueba_funcionamiento',
  'desarme',
  'reparacion',
  'recomendaciones',
];

const PRODUCTION_PROMPT = `La única fuente de verdad es el XLS aprobado.

Traduce la evidencia técnica aprobada al lenguaje técnico utilizado por CM Services.

Genera exclusivamente los siguientes bloques:

- inspeccion_visual
- prueba_funcionamiento
- desarme
- reparacion
- recomendaciones

Toda afirmación debe estar respaldada por evidencia presente en el XLS aprobado.

Utiliza el patrón lingüístico de CM Services, incluyendo expresiones como:

- Equipo presenta...
- Equipo ingresa...
- Equipo Operativo.
- Equipo No Operativo.
- Equipo Operativo; sin embargo...
- Mano de obra...
- Cambio de...
- Reposición de...
- Instalación de...
- Reparación de...
- Limpieza...
- Mantención...
- Pruebas de funcionamiento.
- Pruebas de funcionamiento y certificación.

No inventes información.

No copies el checklist literalmente.

No conviertas "No aplica" en una falla.

No repitas la misma evidencia entre bloques.

Mantén el nombre técnico de los componentes presentes en el XLS.

Deja vacío cualquier bloque que no tenga evidencia suficiente.

Devuelve exclusivamente JSON válido.`;

export function proposalFields() {
  return FIELDS;
}

export function proposalPrompt(xlsText) {
  return `${PRODUCTION_PROMPT}

EVIDENCIA DEL XLS APROBADO:
${xlsText}`;
}
