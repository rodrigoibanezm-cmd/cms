import { fuzzySim, matchTemplate as baseMatchTemplate } from './catalog_matcher.js';
import { structuralToolSignal } from './template_structural_signal.js';
import { applyStructuralVariant } from './template_structural_variant.js';

function removeAccents(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function norm(value) {
  return removeAccents(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function exactTitleEntry(catalog, title) {
  const normalizedTitle = norm(title);
  if (!normalizedTitle) return null;
  return catalog.find((entry) => (entry.aliases || []).some((alias) => {
    const normalizedAlias = norm(alias);
    return normalizedAlias.length > 12 && normalizedAlias === normalizedTitle;
  })) || null;
}

function titleOverride(checklistItems, catalog, signals) {
  const entry = exactTitleEntry(catalog, signals.titulo_formulario);
  if (!entry?.template_filename || entry.template_status !== 'approved') return null;
  return {
    entry,
    similitud: Math.max(fuzzySim(checklistItems, entry.checklist), 0.85),
    titleOverride: true,
  };
}

export function matchTemplateWithSignals(checklistItems, catalog, signals = {}) {
  const structuralSignal = structuralToolSignal(signals);
  const patchedCatalog = catalog.map((entry) => applyStructuralVariant(entry, structuralSignal));
  const override = titleOverride(checklistItems, patchedCatalog, signals);
  const result = override || baseMatchTemplate(checklistItems, patchedCatalog);
  return { ...result, structuralSignal };
}
