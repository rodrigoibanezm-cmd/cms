const CELL_MAPS = {
  BOMBA_HIDRAULICA_TECNICOS: {
    header: {
      ot: 'B2',
      marca: 'B4',
      modelo: 'B5',
      serie: 'B6',
      capacidad: 'B7',
      mecanico_especialista: 'H2',
      tecnico: 'H2',
      cliente: 'H4',
      rotulo: 'H5',
      fecha_evaluacion: 'H6',
    },
    text: {
      inspeccion_visual: 'B30',
      desarme: 'B36',
      procedimiento: 'B39',
    },
    status: {
      operativo: 'A34',
      no_operativo: 'B34',
      reparacion: 'H8',
      mantencion: 'I8',
      de_baja: 'J8',
    },
  },
};

export function getCellMap(templateKey) {
  return CELL_MAPS[templateKey] || null;
}
