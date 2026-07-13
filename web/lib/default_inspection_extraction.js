import { callGemini } from './benchmark/gemini_client.js';
import { geminiModel } from './gemini_models.js';
import { parseModelJson } from '../../benchmark/lib/io.js';

const PROMPT = `Analiza únicamente la sección "INSPECCIÓN DE HERRAMIENTA" del informe.

Este es un formulario DEFAULT: las etiquetas pueden estar escritas a mano en la columna izquierda y sus valores en la columna derecha.

Devuelve JSON estricto:
{"inspeccion":[{"item":"texto columna izquierda","observacion":"texto columna derecha"}]}

Reglas:
- recupera todas las filas donde exista una etiqueta manuscrita a la izquierda;
- conserva el texto completo de ambas columnas;
- no inventes etiquetas impresas;
- no incluyas textos generales escritos atravesando toda la sección;
- no incluyas filas vacías;
- si no existen pares, devuelve {"inspeccion":[]}.`;

function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => ({
      item: String(row?.item || '').trim(),
      resultado: null,
      observacion: String(row?.observacion || '').trim(),
    }))
    .filter((row) => row.item);
}

export async function extractDefaultInspection(image) {
  const response = await callGemini({
    model: geminiModel('GEMINI_EXTRACT_DETAIL_MODEL'),
    prompt: PROMPT,
    image,
  });
  return normalizeRows(parseModelJson(response)?.inspeccion);
}
