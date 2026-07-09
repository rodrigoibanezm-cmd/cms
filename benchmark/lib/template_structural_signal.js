export function normalizeSignal(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

export function structuralToolSignal(signals = {}) {
  const text = normalizeSignal([
    signals.tipo_herramienta,
    signals.accionamiento,
    signals.titulo_formulario,
    signals.sourceName,
  ].filter(Boolean).join(' '));
  if (text.includes('CARRETE')) return 'CARRETE';
  if (text.includes('ESMERIL')) return 'ESMERIL';
  if (text.includes('TALADRO')) return 'TALADRO';
  return null;
}
