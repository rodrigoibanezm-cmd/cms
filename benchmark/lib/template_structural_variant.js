const VARIANTS = {
  TALADRO_TECNICOS_BASE: {
    ESMERIL: { template_key: 'ESMERIL_TECNICOS', template_filename: 'ESMERIL T\u00c9CNICOS.xlsx' },
  },
};

export function applyStructuralVariant(entry, signal) {
  const variant = VARIANTS[entry?.template_key]?.[signal];
  return variant ? { ...entry, ...variant, structural_variant: signal } : entry;
}
