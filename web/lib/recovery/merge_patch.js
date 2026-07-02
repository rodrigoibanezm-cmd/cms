function cloneJson(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function setPath(target, path, value) {
  const parts = String(path).split('.').filter(Boolean);
  if (!parts.length) return;

  let current = target;
  for (let index = 0; index < parts.length - 1; index++) {
    const key = parts[index];
    const nextKey = parts[index + 1];
    if (current[key] == null) current[key] = /^\d+$/.test(nextKey) ? [] : {};
    current = current[key];
  }

  current[parts[parts.length - 1]] = value;
}

export function mergeRecoveryPatch(extraction, patch) {
  const merged = cloneJson(extraction);
  Object.entries(patch || {}).forEach(([field, value]) => setPath(merged, field, value));
  merged.recovery = {
    applied: true,
    patched_fields: Object.keys(patch || {}),
  };
  return merged;
}
