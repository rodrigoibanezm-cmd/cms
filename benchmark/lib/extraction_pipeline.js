import { callGemini } from "./gemini_client.js";
import { calcularConfianza, scoreToSemaforo } from "./confidence.js";
import { decideMatch, matchTemplate } from "./catalog_matcher.js";
import { parseModelJson, saveJson } from "./io.js";

function buildMatchInfo({ entry, similitud, decision, confidence }) {
  return {
    template_key: entry?.template_key || null,
    template_filename: entry?.template_filename || null,
    template_status: entry?.template_status || null,
    similitud_checklist: Math.round(similitud * 100) / 100,
    decision,
    confidence_score: confidence.score,
    razones: confidence.razones,
    mensaje: confidence.mensaje,
    semaforo: scoreToSemaforo(confidence.score),
  };
}

function shouldRunPass2(decision) {
  return decision === "approved_match" || decision === "pending_match_con_alerta";
}

function buildPass2Prompt(promptTemplate, checklist) {
  return promptTemplate.replace(
    "{{CHECKLIST}}",
    checklist.map((item) => `- ${item}`).join("\n")
  );
}

async function runPass1({ image, ot, prompt }) {
  console.log("Pasada 1 (Flash)...");
  const raw = await callGemini({ model: "gemini-2.5-flash", prompt, image });
  const pass1 = parseModelJson(raw);
  pass1.ot = ot;
  return pass1;
}

async function runPass2({ image, promptTemplate, checklist }) {
  console.log("Pasada 2 (Pro)...");
  const prompt = buildPass2Prompt(promptTemplate, checklist);
  const raw = await callGemini({ model: "gemini-2.5-pro", prompt, image });
  const pass2 = parseModelJson(raw);
  return pass2.inspeccion || [];
}

export async function runExtraction({
  image,
  ot,
  targetDir,
  promptPass1,
  promptPass2Template,
  catalog,
}) {
  const pass1 = await runPass1({ image, ot, prompt: promptPass1 });
  saveJson(targetDir, ot, "pass1", pass1);

  const checklistItems = pass1.checklist_items || [];
  const { entry, similitud } = matchTemplate(checklistItems, catalog);
  const decision = decideMatch({ entry, similitud });

  console.log(
    `Match: ${entry?.template_key || "ninguno"} (similitud=${similitud.toFixed(2)}) -> ${decision}`
  );

  let inspeccion = [];
  if (shouldRunPass2(decision)) {
    inspeccion = await runPass2({
      image,
      promptTemplate: promptPass2Template,
      checklist: entry.checklist,
    });
  } else {
    console.log(`No se ejecuta Pasada 2 automática (decision=${decision}).`);
  }

  const confidence = calcularConfianza({ pass1, decision, inspeccion });
  const matchInfo = buildMatchInfo({ entry, similitud, decision, confidence });
  saveJson(targetDir, ot, "match", matchInfo);

  const final = {
    ...pass1,
    ...matchInfo,
    inspeccion,
  };

  saveJson(targetDir, ot, "gemini", final);

  console.log(`\n--- RESULTADO FINAL --- ${matchInfo.semaforo} (score=${confidence.score})`);
  console.log(confidence.mensaje);
  console.log(JSON.stringify(final, null, 2));

  return final;
}
