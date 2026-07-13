import { findCellByLabel, norm, setBesideLabel, setVisibleCell, text, writableCellToRight } from './cell_utils.js';
import { clearCellsBelowLabels, findLayoutLabel, markCellBelowLabel } from './template_layout.js';

export function canonicalOption(value, aliases = {}) {
  const key = norm(value);
  return aliases[key] || key;
}

function labelsFor(option, labels) {
  return labels[option] || [option];
}

export function fillLabeledOption(sheet, value, config) {
  if (!text(value)) return false;
  const option = canonicalOption(value, config.aliases);
  const group = config.group || [];
  const labelGroups = group.map((item) => labelsFor(item, config.labels));
  const targetLabels = labelsFor(option, config.labels);
  const target = findLayoutLabel(sheet, targetLabels, { maxRow: config.maxRow || 20, exactOnly: true });

  if (target) {
    clearCellsBelowLabels(sheet, labelGroups, { maxRow: config.maxRow || 20, exactOnly: true });
    return markCellBelowLabel(sheet, targetLabels, 'X', { maxRow: config.maxRow || 20, exactOnly: true });
  }

  if (!config.fallbackAnchors?.length) return false;
  return setBesideLabel(sheet, config.fallbackAnchors, value, {
    maxRow: config.maxRow || 20,
    exactOnly: false,
  });
}

export function fillFreeTextNearLabel(sheet, labels, value, options = {}) {
  if (!text(value)) return false;
  const found = findCellByLabel(sheet, labels, options);
  if (!found) return false;
  const target = writableCellToRight(sheet, found.row, found.col);
  setVisibleCell(target, value);
  return true;
}
