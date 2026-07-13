import { CONFIDENCE_ALGORITHM as DEFAULT_CONFIG } from "./confidence_config.js";

const REQUIRED = ["ot", "tecnico", "cliente", "marca", "modelo", "serie", "estado_herramienta"];
const FREE_TEXT = ["inspeccion_visual", "prueba_funcionamiento", "desarme", "procedimiento"];

function unreadable(config) {
  return {
    score: 0, version: config.version,
    breakdown: [{ rule: "ilegible", points: -100, reason: "no se pudo leer el checklist" }],
    razones: ["no se pudo leer el checklist del formulario"],
    mensaje: "La calidad de la imagen no permite identificar el checklist. Toma nuevamente la fotografía.",
  };
}

function message(score, reasons) {
  if (score >= 90) return "El informe se procesó correctamente.";
  if (score >= 70) return `Revisa: ${reasons.join("; ")}. El resto del informe fue extraído correctamente.`;
  return `La extracción presenta problemas: ${reasons.join("; ")}. Se recomienda revisar la foto o volver a intentar.`;
}

function isNarrative(pass1) {
  return pass1.document_structure === "narrative_report" || pass1.has_printed_checklist === false;
}

function hasNarrativeContent(pass1) {
  return FREE_TEXT.some((field) => Boolean(pass1[field])) || (Array.isArray(pass1.repuestos) && pass1.repuestos.length > 0);
}

export function scoreToSemaforo(score) {
  if (score >= 90) return "VERDE";
  if (score >= 70) return "AMARILLO";
  return "ROJO";
}

export function calcularConfianza({ pass1, decision, inspeccion = [] }, config = DEFAULT_CONFIG) {
  if (pass1._parse_error) return unreadable(config);
  const w = config.weights;
  let score = 100;
  const breakdown = [];
  const razones = [];
  const subtract = (rule, points, reason) => {
    score -= points;
    breakdown.push({ rule, points: -points, reason });
    razones.push(reason);
  };
  const narrative = isNarrative(pass1);
  const hasChecklist = Array.isArray(pass1.checklist_items) && pass1.checklist_items.length;
  const recovered = inspeccion.some((x) => x?.item && x?.resultado && x.resultado !== "NO APLICA");
  if (!narrative && !hasChecklist && !recovered) return unreadable(config);
  if (narrative && !hasNarrativeContent(pass1)) return unreadable(config);
  if (!narrative && !hasChecklist) subtract("checklist_reconstruido", w.checklist_reconstruido, "checklist reconstruido desde observación narrativa");

  const decisions = {
    varios: [w.varios, "formulario no reconocido en el catálogo"],
    revision_manual: [w.revision_manual, "match dudoso con el catálogo"],
    pending_match_con_alerta: [w.pending_match_con_alerta, "formulario reconocido pero aún sin plantilla aprobada"],
  };
  if (decisions[decision] && !(narrative && decision === "varios")) subtract(decision, ...decisions[decision]);

  const missing = REQUIRED.filter((field) => !pass1[field]);
  if (missing.length) subtract("campos_obligatorios", missing.length * w.campo_obligatorio_faltante, `campos sin leer: ${missing.join(", ")}`);

  const unmarked = inspeccion.filter((x) => x.observacion === "sin marca visible").length;
  if (unmarked) subtract("items_sin_marca", Math.min(unmarked * w.item_sin_marca, w.item_sin_marca_max), `${unmarked} ítem(s) del checklist sin marca visible`);

  if (FREE_TEXT.filter((field) => !pass1[field]).length >= 2) {
    subtract("textos_libres_vacios", w.textos_libres_vacios, "varias secciones de texto libre vacías");
  }
  score = Math.max(0, Math.min(100, score));
  return { score, version: config.version, breakdown, razones, mensaje: message(score, razones) };
}
