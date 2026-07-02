export function buildRecoveryPrompt({ extraction, targets, audit }) {
  return `Relee quirúrgicamente solo los campos indicados usando la imagen original.

Principios:
- Devuelve SOLO JSON válido.
- No reextraigas todo el informe.
- No modifiques campos no solicitados.
- Si no puedes confirmar un campo con claridad, no lo incluyas.
- El resultado debe tener este formato exacto: { "patch": { "campo": "valor" } }

JSON actual:
${JSON.stringify(extraction || {}, null, 2)}

Diagnóstico del auditor:
${JSON.stringify(audit?.issues || [], null, 2)}

Campos a releer:
${JSON.stringify(targets || [], null, 2)}
`;
}
