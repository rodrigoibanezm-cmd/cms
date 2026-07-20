function normalizeAlias(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

function getPath(context, path) {
  return path.split('.').reduce((value, key) => value?.[key], context);
}

export function selectCertifiedFamily(catalog, context) {
  const matches = Object.entries(catalog.families || {}).filter(([, family]) => {
    const candidate = normalizeAlias(getPath(context, family.classifier.source_field));
    return family.aliases.includes(candidate);
  });

  if (matches.length !== 1) {
    throw new Error(`Certified family resolution produced ${matches.length} matches`);
  }

  return { key: matches[0][0], contract: matches[0][1] };
}
