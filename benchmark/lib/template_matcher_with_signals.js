import { fuzzySim, matchTemplate as baseMatchTemplate } from './catalog_matcher.js';
import { isGenericSignal, matchCatalogSignal } from './catalog_signal_matcher.js';
import { structuralToolSignal } from './template_structural_signal.js';
import { applyStructuralVariant } from './template_structural_variant.js';

function signalOverride(checklistItems, catalog, signal, source) {
  const entry = matchCatalogSignal(catalog, signal);
  if (!entry) return null;
  return {
    entry,
    similitud: Math.max(fuzzySim(checklistItems, entry.checklist), 0.9),
    signalOverride: source,
  };
}

function titleOverride(checklistItems, catalog, title) {
  if (isGenericSignal(title)) return null;
  return signalOverride(checklistItems, catalog, title, 'titulo_formulario');
}

function toolTypeOverride(checklistItems, catalog, toolType) {
  if (isGenericSignal(toolType)) return null;
  return signalOverride(checklistItems, catalog, toolType, 'tipo_herramienta');
}

export function matchTemplateWithSignals(checklistItems, catalog, signals = {}) {
  const structuralSignal = structuralToolSignal(signals);
  const patchedCatalog = catalog.map((entry) => applyStructuralVariant(entry, structuralSignal));
  const override = toolTypeOverride(checklistItems, patchedCatalog, signals.tipo_herramienta)
    || titleOverride(checklistItems, patchedCatalog, signals.titulo_formulario);
  const result = override || baseMatchTemplate(checklistItems, patchedCatalog);
  return { ...result, structuralSignal };
}
