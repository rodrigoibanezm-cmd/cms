import { norm } from './cell_utils.js';
import {
  clearCellsBelowLabels,
  findLayoutLabel,
  markCellBelowLabel,
} from './template_layout.js';

const OPTIONS = [
  ['REPARACIÓN', 'REPARACION'],
  ['MANTENCIÓN', 'MANTENCION'],
  ['DE BAJA'],
  ['PREVENTIVO'],
  ['CORRECTIVO'],
  ['E.NUEVO', 'E NUEVO', 'EQUIPO NUEVO'],
  ['DEVOLUCIÓN DE EQUIPO', 'DEVOLUCION DE EQUIPO'],
  ['CERTIFICACIÓN', 'CERTIFICACION'],
];

function statusText(data) {
  return norm(`${data.estado_herramienta || ''} ${data.estado_final || ''}`);
}

function score(status, label) {
  const clean = norm(label);
  if (!status || !clean) return 0;
  if (status === clean) return 100;
  if (status.includes(clean) || clean.includes(status)) return 80;
  const wanted = status.split(' ').filter((word) => word.length > 3);
  const words = clean.split(' ').filter((word) => word.length > 3);
  const matches = words.filter((word) => wanted.includes(word)).length;
  return matches ? Math.round((matches / Math.max(wanted.length, words.length)) * 70) : 0;
}

function bestOption(sheet, status) {
  let best = null;
  for (const labels of OPTIONS) {
    const found = findLayoutLabel(sheet, labels, { maxRow: 20, exactOnly: true });
    if (!found) continue;
    const optionScore = Math.max(...labels.map((label) => score(status, label)));
    if (optionScore >= 60 && (!best || optionScore > best.score)) {
      best = { labels, score: optionScore };
    }
  }
  return best;
}

export function fillDynamicDisposition(sheet, data) {
  const status = statusText(data);
  if (!status) return false;
  const option = bestOption(sheet, status);
  if (!option) return false;
  clearCellsBelowLabels(sheet, OPTIONS, { maxRow: 20, exactOnly: true });
  return markCellBelowLabel(sheet, option.labels, 'X', { maxRow: 20, exactOnly: true });
}
