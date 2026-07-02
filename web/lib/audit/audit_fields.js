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
  'inspeccion',
  'inspeccion_visual',
  'prueba_funcionamiento',
  'desarme',
  'procedimiento',
  'repuestos',
];

export const AUTO_RECOVERY_FIELDS = [
  'ot',
  'cliente',
  'rotulo',
  'fecha_evaluacion',
  'tecnico',
  'marca',
  'modelo',
  'serie',
  'capacidad',
  'tipo',
  'tipo_torque',
  'accionamiento',
  'estado_herramienta',
  'estado_operativo',
  'estado_final',
  'inspeccion',
];

export const AUDIT_PATCH_FIELD_SET = new Set(AUDIT_PATCH_FIELDS);
export const AUTO_RECOVERY_FIELD_SET = new Set(AUTO_RECOVERY_FIELDS);

export function auditPatchFieldsText() {
  return AUDIT_PATCH_FIELDS.join('|');
}

export function autoRecoveryFieldsText() {
  return AUTO_RECOVERY_FIELDS.join('|');
}
