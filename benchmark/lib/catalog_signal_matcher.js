const GENERIC_SIGNALS = new Set([
  'INFORME',
  'TECNICO',
  'TECNICA',
  'BASE',
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

function tokens(value) {
  return normSignal(value)
    .split(' ')
    .filter((token) => token.length > 3 && !GENERIC_SIGNALS.has(token));
}

export function isGenericSignal(value) {
  return tokens(value).length === 0;
}

function candidateNames(entry) {
  return [entry.display_name, ...(entry.aliases || [])]
    .map(normSignal)
    .filter((value) => value && !isGenericSignal(value));
}

function tokenMatch(signal, name) {
  const signalTokens = tokens(signal);
  const nameTokens = new Set(tokens(name));
  if (signalTokens.length > 1) return signalTokens.every((token) => nameTokens.has(token));
  return signalTokens.some((token) => nameTokens.has(token));
}

function signalMatchesName(signal, name) {
  if (signal === name) return true;
  if (signal.length > 5 && name.includes(signal)) return true;
  if (name.length > 5 && signal.includes(name)) return true;
  return tokenMatch(signal, name);
}

export function matchCatalogSignal(catalog, signal) {
  const normalized = normSignal(signal);
  if (isGenericSignal(normalized)) return null;
  return catalog.find((entry) => {
    if (!entry?.template_filename || entry.template_status !== 'approved') return false;
    return candidateNames(entry).some((name) => signalMatchesName(normalized, name));
  }) || null;
}
