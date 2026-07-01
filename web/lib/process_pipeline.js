import fs from 'fs';
import path from 'path';
import { callGemini } from './benchmark/gemini_client.js';
import { validateExtraction } from './extraction_validator.js';
import { calcularConfianza, scoreToSemaforo } from '../../benchmark/lib/confidence.js';
import { decideMatch, matchTemplate, resolveFallbackEntry } from '../../benchmark/lib/catalog_matcher.js';
import { parseModelJson } from '../../benchmark/lib/io.js';

function saveJson(targetDir, ot, name, data) {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, `${ot || 'SIN_OT'}_${name}.json`), JSON.stringify(data, null, 2));
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

export async function runExtraction({
  image,
  otHint,
  sourceName,
  targetDir,
  promptPass1,
  promptPass2Template,
  catalog,
}) {
  console.log('Pasada 1 (Flash)...');
  const pass1 = parseModelJson(await callGemini({ model: 'gemini-2.5-flash', prompt: promptPass1, image }));
  if (otHint) pass1.ot = otHint;
  saveJson(targetDir, pass1.ot, 'pass1', pass1);

  const { entry, similitud } = matchTemplate(pass1.checklist_items || [], catalog);
  const decision = decideMatch({ entry, similitud });
  const templateEntry = decision === 'varios' ? resolveFallbackEntry(catalog) : entry;

  let inspeccion = [];
  if (shouldRunPass2(decision)) {
    console.log('Pasada 2 (Pro)...');
    const prompt = buildPass2Prompt(promptPass2Template, entry.checklist);
    const pass2 = parseModelJson(await callGemini({ model: 'gemini-2.5-pro', prompt, image }));
    inspeccion = pass2.inspeccion || [];
  }

  const confidence = calcularConfianza({ pass1, decision, inspeccion });
  const final = validateExtraction({
    ...pass1,
    template_key: templateEntry?.template_key || null,
    template_filename: cleanTemplateFilename(templateEntry?.template_filename),
    template_status: templateEntry?.template_status || null,
    mejor_intento_familia: entry?.template_key || null,
    similitud_checklist: Math.round(similitud * 100) / 100,
    decision,
    confidence_score: confidence.score,
    razones: confidence.razones,
    mensaje: confidence.mensaje,
    semaforo: scoreToSemaforo(confidence.score),
    inspeccion,
  }, { otHint, sourceName });

  saveJson(targetDir, final.ot, 'gemini', final);
  return final;
}
