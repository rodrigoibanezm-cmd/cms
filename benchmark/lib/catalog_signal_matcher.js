const GENERIC_SIGNALS = new Set([
  'INFORME',
  'INFORME TECNICO',
  'TECNICO',
  'ELECTRICO',
  'ELECTRICA',
  'NEUMATICO',
  'NEUMATICA',
  'INALAMBRICO',
  'INALAMBRICA',
]);

function removeAccents(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normSignal(value) {
  return removeAccents(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isGenericSignal(value) {
  const normalized = normSignal(value);
  return !normalized || GENERIC_SIGNALS.has(normalized);
}

function candidateNames(entry) {
  return [entry.display_name, ...(entry.aliases || [])]
    .map(normSignal)
    .filter((value) => value && !isGenericSignal(value));
}

function signalMatchesName(signal, name) {
  if (signal === name) return true;
  if (signal.length > 5 && name.includes(signal)) return true;
  return name.length > 5 && signal.includes(name);
}

export function matchCatalogSignal(catalog, signal) {
  const normalized = normSignal(signal);
  if (isGenericSignal(normalized)) return null;
  return catalog.find((entry) => {
    if (!entry?.template_filename || entry.template_status !== 'approved') return false;
    return candidateNames(entry).some((name) => signalMatchesName(normalized, name));
  }) || null;
}
