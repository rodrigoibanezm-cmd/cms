import { callGemini } from './benchmark/gemini_client.js';
import { geminiModel } from './gemini_models.js';
import { parseModelJson } from '../../benchmark/lib/io.js';

const PROMPT = `Revisa únicamente los grupos de opciones impresas en la parte superior del informe.

Busca estos grupos, si existen:
- TORQUE / IMPACTO
- NEUMÁTICA / ELÉCTRICA / INALÁMBRICA
- ESTADO DE HERRAMIENTA, por ejemplo REPARACIÓN / MANTENCIÓN / DE BAJA o PREVENTIVO / CORRECTIVO / E.NUEVO

Devuelve JSON estricto:
{
  "tipo_llave":{"presente":true,"valor":"TORQUE"},
  "accionamiento":{"presente":true,"valor":"INALAMBRICA"},
  "estado_herramienta":{"presente":true,"valor":null}
}

Reglas:
- presente=true solo cuando el grupo de opciones está impreso y visible;
- valor debe corresponder exclusivamente a una marca manuscrita visible dentro del grupo;
- si el grupo existe pero ninguna opción está marcada, usa valor=null;
- si el grupo no existe, usa presente=false y valor=null;
- no infieras desde marca, modelo, procedimiento, inspección, observaciones ni otros textos;
- una palabra escrita cerca no cuenta como marca si no está dentro de una opción;
- normaliza valores sin tildes: TORQUE, IMPACTO, NEUMATICA, ELECTRICA, INALAMBRICA, REPARACION, MANTENCION, DE_BAJA, PREVENTIVO, CORRECTIVO, EQUIPO_NUEVO.`;

function option(result, key) {
  const raw = result?.[key];
  return {
    presente: raw?.presente === true,
    valor: raw?.valor ? String(raw.valor).trim().toUpperCase() : null,
  };
}

export async function extractMarkedOptions(image) {
  const response = await callGemini({
    model: geminiModel('GEMINI_EXTRACT_MODEL'),
    prompt: PROMPT,
    image,
  });
  const parsed = parseModelJson(response);
  return {
    tipo_llave: option(parsed, 'tipo_llave'),
    accionamiento: option(parsed, 'accionamiento'),
    estado_herramienta: option(parsed, 'estado_herramienta'),
  };
}

export function applyMarkedOptions(pass1, options) {
  const next = { ...pass1 };
  for (const key of ['tipo_llave', 'accionamiento', 'estado_herramienta']) {
    if (options?.[key]?.presente) next[key] = options[key].valor;
  }
  return next;
}
