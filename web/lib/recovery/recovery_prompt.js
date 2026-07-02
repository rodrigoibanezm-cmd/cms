export function buildRecoveryPrompt({ extraction, patches }) {
  return `Corrige únicamente los campos indicados del JSON de extracción usando la imagen original.

Reglas:
- Devuelve SOLO JSON válido.
- No reextraigas todo el informe.
- No modifiques campos no solicitados.
- Si no puedes confirmar un campo, no lo incluyas en patch.
- El resultado debe tener este formato exacto: { "patch": { "campo": "valor" } }

JSON actual:
${JSON.stringify(extraction || {}, null, 2)}

Campos a corregir:
${JSON.stringify(patches || [], null, 2)}
`;
}
