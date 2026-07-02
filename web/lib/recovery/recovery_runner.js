import { callGemini } from '../benchmark/gemini_client.js';
import { parseModelJson } from '../../../benchmark/lib/io.js';
import { buildRecoveryPrompt } from './recovery_prompt.js';

const ALLOWED_FIELDS = new Set([
  'ot',
  'cliente',
  'area_usuaria',
  'rotulo',
  'fecha_evaluacion',
  'tecnico',
  'marca',
  'modelo',
  'serie',
  'capacidad',
  'cuadrante',
  'tipo',
  'tipo_torque',
  'accionamiento',
  'estado_herramienta',
  'estado_final',
  'estado_operativo',
  'inspeccion_visual',
  'prueba_funcionamiento',
  'desarme',
  'procedimiento',
]);

function filterAllowed(patches) {
  return (patches || []).filter((item) => ALLOWED_FIELDS.has(String(item?.field || '')));
}

export async function runRecovery({ image, extraction, audit }) {
  const patches = filterAllowed(audit?.patches);
  if (audit?.decision !== 'recover' || !patches.length) {
    console.log('[recovery] skipped', {
      ot: extraction?.ot,
      decision: audit?.decision,
      requested: audit?.patches?.map((patch) => patch.field) || [],
    });
    return null;
  }

  console.log('[recovery] start', { ot: extraction?.ot, fields: patches.map((patch) => patch.field) });
  const prompt = buildRecoveryPrompt({ extraction, patches });
  const raw = await callGemini({ model: 'gemini-2.5-pro', prompt, image });
  const parsed = parseModelJson(raw);
  const patch = parsed?.patch && typeof parsed.patch === 'object' ? parsed.patch : null;
  if (!patch || Array.isArray(patch)) {
    console.log('[recovery] no_patch', { ot: extraction?.ot });
    return null;
  }

  console.log('[recovery] patch', { ot: extraction?.ot, fields: Object.keys(patch) });
  return {
    patch,
    source_audit: audit,
  };
}
