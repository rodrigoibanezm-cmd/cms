export const CONFIDENCE_ALGORITHM = {
  version: "confidence-v1",
  auditWeights: { simple_auto_recovery: 5, critical: 15, high: 12, medium: 8, low: 5 },
  weights: {
    varios: 60,
    revision_manual: 40,
    pending_match_con_alerta: 5,
    checklist_reconstruido: 10,
    campo_obligatorio_faltante: 8,
    item_sin_marca: 5,
    item_sin_marca_max: 20,
    textos_libres_vacios: 10,
  },
};
