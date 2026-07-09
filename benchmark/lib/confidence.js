// Pesos heurísticos. No están calibrados con datos reales todavía.
// Cuando exista el comparador XLS original vs generado, recalibrar con error real.
const PESOS = {
  varios: 60,
  revision_manual: 40,
  pending_match: 15,
  checklist_reconstruido: 10,
  campo_obligatorio_faltante: 8,
  item_sin_marca: 5,
  item_sin_marca_max: 20,
  textos_libres_vacios: 10,
};

const CAMPOS_OBLIGATORIOS = [
  "ot",
  "tecnico",
  "cliente",
  "marca",
  "modelo",
  "serie",
  "estado_herramienta",
];

const TEXTOS_LIBRES = [
  "inspeccion_visual",
  "prueba_funcionamiento",
  "desarme",
  "procedimiento",
];

function contarSinMarca(inspeccion) {
  return inspeccion.filter((i) => i.observacion === "sin marca visible").length;
}

function hasChecklist(pass1) {
  return Array.isArray(pass1.checklist_items) && pass1.checklist_items.length > 0;
}

function hasRecoveredInspection(inspeccion) {
  return Array.isArray(inspeccion) && inspeccion.some((item) => {
    return item?.item && item?.resultado && item.resultado !== "NO APLICA";
  });
}

function unreadableResult() {
  return {
    score: 0,
    razones: ["no se pudo leer el checklist del formulario"],
    mensaje: "La calidad de la imagen no permite identificar el checklist. Toma nuevamente la fotografía.",
  };
}

function mensajePorScore(score, razones) {
  if (score >= 90) return "El informe se procesó correctamente.";

  if (score >= 70) {
    return `Revisa: ${razones.join("; ")}. El resto del informe fue extraído correctamente.`;
  }

  return `La extracción presenta problemas: ${razones.join("; ")}. Se recomienda revisar la foto o volver a intentar.`;
}

export function scoreToSemaforo(score) {
  if (score >= 90) return "VERDE";
  if (score >= 70) return "AMARILLO";
  return "ROJO";
}

export function calcularConfianza({ pass1, decision, inspeccion }) {
  let score = 100;
  const razones = [];

  if (pass1._parse_error) return unreadableResult();

  if (!hasChecklist(pass1)) {
    if (!hasRecoveredInspection(inspeccion)) return unreadableResult();
    score -= PESOS.checklist_reconstruido;
    razones.push("checklist reconstruido desde observación narrativa");
  }

  if (decision === "varios") {
    score -= PESOS.varios;
    razones.push("formulario no reconocido en el catálogo");
  } else if (decision === "revision_manual") {
    score -= PESOS.revision_manual;
    razones.push("match dudoso con el catálogo");
  } else if (decision === "pending_match_con_alerta") {
    score -= PESOS.pending_match;
    razones.push("formulario reconocido pero aún sin plantilla aprobada");
  }

  const faltantes = CAMPOS_OBLIGATORIOS.filter((campo) => !pass1[campo]);
  if (faltantes.length > 0) {
    score -= faltantes.length * PESOS.campo_obligatorio_faltante;
    razones.push(`campos sin leer: ${faltantes.join(", ")}`);
  }

  const sinMarca = inspeccion.length ? contarSinMarca(inspeccion) : 0;
  if (sinMarca > 0) {
    score -= Math.min(sinMarca * PESOS.item_sin_marca, PESOS.item_sin_marca_max);
    razones.push(`${sinMarca} ítem(s) del checklist sin marca visible`);
  }

  const textosVacios = TEXTOS_LIBRES.filter((campo) => !pass1[campo]);
  if (textosVacios.length >= 2) {
    score -= PESOS.textos_libres_vacios;
    razones.push("varias secciones de texto libre vacías");
  }

  score = Math.max(0, Math.min(100, score));
  return { score, razones, mensaje: mensajePorScore(score, razones) };
}
