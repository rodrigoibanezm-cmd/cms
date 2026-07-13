import { text } from './cell_utils.js';
import { fillLabeledOption } from './option_field_fill.js';

const LABELS = {
  REPARACION: ['REPARACIÓN', 'REPARACION'],
  MANTENCION: ['MANTENCIÓN', 'MANTENCION'],
  DE_BAJA: ['DE BAJA'],
  PREVENTIVO: ['PREVENTIVO'],
  CORRECTIVO: ['CORRECTIVO'],
  EQUIPO_NUEVO: ['E.NUEVO', 'E NUEVO', 'EQUIPO NUEVO'],
  DEVOLUCION: ['DEVOLUCIÓN DE EQUIPO', 'DEVOLUCION DE EQUIPO'],
  CERTIFICACION: ['CERTIFICACIÓN', 'CERTIFICACION'],
};

const ALIASES = {
  REPARACION: 'REPARACION',
  MANTENCION: 'MANTENCION',
  MANTENIMIENTO: 'MANTENCION',
  'DE BAJA': 'DE_BAJA',
  BAJA: 'DE_BAJA',
  PREVENTIVO: 'PREVENTIVO',
  CORRECTIVO: 'CORRECTIVO',
  'E NUEVO': 'EQUIPO_NUEVO',
  'EQUIPO NUEVO': 'EQUIPO_NUEVO',
  'DEVOLUCION DE EQUIPO': 'DEVOLUCION',
  DEVOLUCION: 'DEVOLUCION',
  CERTIFICACION: 'CERTIFICACION',
};

const GROUP = Object.keys(LABELS);

export function fillDynamicDisposition(sheet, data) {
  const value = data.estado_herramienta;
  if (!text(value)) return false;
  return fillLabeledOption(sheet, value, {
    aliases: ALIASES,
    labels: LABELS,
    group: GROUP,
    fallbackAnchors: ['ESTADO DE HERRAMIENTA'],
    maxRow: 20,
  });
}
