import { norm } from './cell_utils.js';

const KEY_ALIASES = {
  BRAZOSDEAPOYO: 'BRAZODEAPOYO',
  BRAZODEAPOYO: 'BRAZODEAPOYO',
  MANIJADETRASLADO: 'MANILLASDEAGARRE',
  MANILLADETRASLADO: 'MANILLASDEAGARRE',
  MANILLASDEAGARRE: 'MANILLASDEAGARRE',
  MANILLADEAGARRE: 'MANILLASDEAGARRE',
  SEGURODEPEDESTAL: 'PEDESTALYSEGUROS',
  SEGUROSDEPEDESTAL: 'PEDESTALYSEGUROS',
  PEDESTAL: 'PEDESTALYSEGUROS',
  PEDESTALYSEGUROS: 'PEDESTALYSEGUROS',
  SWITCHENCENDIDO: 'SWITCHDEENCENDIDO',
  SWITCHDEENCENDIDO: 'SWITCHDEENCENDIDO',
  PERNOSYTUERCAS: 'PERNOS',
  TORNILLOSYTUERCAS: 'PERNOS',
  COMPONENTESINTYERNOS: 'COMPONENTESINTERNOS',
};

function looseKey(value) {
  return norm(value)
    .replace(/PRICIPAL/g, 'PRINCIPAL')
    .replace(/INTYERNOS/g, 'INTERNOS')
    .replace(/SISTEMADE/g, 'SISTEMA DE')
    .replace(/SISTEMAS/g, 'SISTEMA')
    .replace(/[^A-Z0-9]/g, '');
}

export function itemKey(value) {
  const key = looseKey(value);
  return KEY_ALIASES[key] || key;
}

export function normalizeItem(item) {
  return {
    item: item?.item || item?.descripcion || item?.description || '',
    resultado: norm(item?.resultado || item?.estado || item?.result || ''),
    observacion: item?.observacion || item?.observación || item?.observation || null,
    reparacion: item?.reparacion || item?.reparación || null,
  };
}

export function sameInspectionItem(a, b) {
  const left = itemKey(a);
  const right = itemKey(b);
  return Boolean(left && right && left === right);
}
