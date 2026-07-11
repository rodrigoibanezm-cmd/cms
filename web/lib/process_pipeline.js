import fs from 'fs';
import path from 'path';
import { callGemini } from './benchmark/gemini_client.js';
import { geminiModel } from './gemini_models.js';
import { validateExtraction } from './extraction_validator.js';
import { calcularConfianza, scoreToSemaforo } from '../../benchmark/lib/confidence.js';
import { decideMatch, resolveFallbackEntry } from '../../benchmark/lib/catalog_matcher.js';
import { parseModelJson } from '../../benchmark/lib/io.js';
import { matchTemplateWithSignals } from '../../benchmark/lib/template_matcher_with_signals.js';

function safeFilePart(value) {
  return String(value || 'SIN_OT')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/^_+|_+$/g, '') || 'SIN_OT';
}

function saveJson(targetDir, ot, name, data) {
  fs.mkdirSync(targetDir, { recursive: true });
  const filename = `${safeFilePart(ot)}_${safeFilePart(name)}.json`;
  fs.writeFileSync(path.join(targetDir, filename), JSON.stringify(data, null, 2));
}

function buildPass2Prompt(template, checklist) {
  return template.replace('{{CHECKLIST}}', checklist.map((item) => `- ${item}`).join('\n'));
}

function shouldRunPass2(decision) {
  return decision === 'approved_match' || decision === 'pending_match_con_alerta';
}

function cleanTemplateFilename(name) {
  return name ? name.replace(' (1).xlsx', '.xlsx') : null;
}

function templateSignals(pass1, sourceName) {
  return {
    titulo_formulario: pass1.titulo_formulario,
    tipo_herramienta: pass1.tipo_herramienta,
    accionamiento: pass1.accionamiento,
    sourceName,
  };
}

export async function runExtraction({
  image,
  otHint,
  sourceName,
  targetDir,
  promptPass1,
  promptPass2Template,
  catalog,
}) {
  console.log('Pasada 1 (Gemini)...');
  const pass1 = parseModelJson(await callGemini({ model: geminiModel('GEMINI_EXTRACT_MODEL'), prompt: promptPass1, image }));
  if (otHint) pass1.ot = otHint;
  saveJson(targetDir, pass1.ot, 'pass1', pass1);

  const { entry, similitud, structuralSignal } = matchTemplateWithSignals(
    pass1.checklist_items || [],
    catalog,
    templateSignals(pass1, sourceName)
  );
  const decision = decideMatch({ entry, similitud });
  const templateEntry = decision === 'varios' ? resolveFallbackEntry(catalog) : entry;

  let inspeccion = [];
  if (shouldRunPass2(decision)) {
    console.log('Pasada 2 (Gemini)...');
    const prompt = buildPass2Prompt(promptPass2Template, entry.checklist);
    const pass2 = parseModelJson(await callGemini({ model: geminiModel('GEMINI_EXTRACT_DETAIL_MODEL'), prompt, image }));
    inspeccion = pass2.inspeccion || [];
  }

  const confidence = calcularConfianza({ pass1, decision, inspeccion });
  const final = validateExtraction({
    ...pass1,
    template_key: templateEntry?.template_key || null,
    template_filename: cleanTemplateFilename(templateEntry?.template_filename),
    template_drive_file_id: templateEntry?.template_drive_id || null,
    template_status: templateEntry?.template_status || null,
    mejor_intento_familia: entry?.template_key || null,
    similitud_checklist: Math.round(similitud * 100) / 100,
    structural_signal: structuralSignal,
    decision,
    confidence_score: confidence.score,
    confidence_version: confidence.version,
    confidence_breakdown: confidence.breakdown,
    razones: confidence.razones,
    mensaje: confidence.mensaje,
    semaforo: scoreToSemaforo(confidence.score),
    inspeccion,
  }, {
    otHint,
    sourceName,
    expectedChecklistLength: templateEntry?.checklist?.length || 0,
  });

  saveJson(targetDir, final.ot, 'gemini', final);
  return final;
}