import { matchTemplate as baseMatchTemplate } from './catalog_matcher.js';
import { structuralToolSignal } from './template_structural_signal.js';
import { applyStructuralVariant } from './template_structural_variant.js';

export function matchTemplateWithSignals(checklistItems, catalog, signals = {}) {
  const structuralSignal = structuralToolSignal(signals);
  const patchedCatalog = catalog.map((entry) => applyStructuralVariant(entry, structuralSignal));
  const result = baseMatchTemplate(checklistItems, patchedCatalog);
  return { ...result, structuralSignal };
}
