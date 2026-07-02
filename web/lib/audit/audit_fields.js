export const AUDIT_PATCH_FIELDS = [
  'ot',
  'cliente',
  'area_usuaria',
  'rotulo',
  'fecha_evaluacion',
  'tecnico',
  'marca',
  'modelo',
  'serie',
  'capacidad',
  'cuadrante',
  'tipo',
  'tipo_torque',
  'accionamiento',
  'estado_herramienta',
  'estado_final',
  'estado_operativo',
  'inspeccion_visual',
  'prueba_funcionamiento',
  'desarme',
  'procedimiento',
  'repuestos',
];

export const AUDIT_PATCH_FIELD_SET = new Set(AUDIT_PATCH_FIELDS);

export function auditPatchFieldsText() {
  return AUDIT_PATCH_FIELDS.join('|');
}
