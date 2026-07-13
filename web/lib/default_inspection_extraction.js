import { callGemini } from './benchmark/gemini_client.js';
import { geminiModel } from './gemini_models.js';
import { parseModelJson } from '../../benchmark/lib/io.js';

const PROMPT = `Analiza únicamente la sección "INSPECCIÓN DE HERRAMIENTA" del informe.

Este es un formulario DEFAULT. Recorre la sección fila por fila: puede haber texto manuscrito en ambas columnas o solo en OBSERVACIÓN.

Devuelve JSON estricto:
{"inspeccion":[{"item":"texto o null","observacion":"texto o null"}]}

Reglas:
- recupera todas las filas manuscritas no vacías;
- si hay texto a izquierda y derecha, conserva ambos;
- si la izquierda está vacía y hay texto a la derecha, usa item null y conserva toda la observación;
- conserva cada línea en su fila y en el orden visual original;
- no inventes etiquetas impresas;
- no incluyas textos generales escritos atravesando toda la sección;
- si no hay contenido, devuelve {"inspeccion":[]}.`;

function clean(value) {
  const result = String(value || '').trim();
  return result || null;
}

function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => ({
      item: clean(row?.item),
      resultado: null,
      observacion: clean(row?.observacion),
    }))
    .filter((row) => row.item || row.observacion);
}

export async function extractDefaultInspection(image) {
  const response = await callGemini({
    model: geminiModel('GEMINI_EXTRACT_DETAIL_MODEL'),
    prompt: PROMPT,
    image,
  });
  return normalizeRows(parseModelJson(response)?.inspeccion);
}
