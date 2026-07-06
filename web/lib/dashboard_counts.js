function average(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return null;
  return Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length);
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || '-';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function buildDashboardCounts(reports) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: reports.length,
    today: reports.filter((row) => String(row.created_at).slice(0, 10) === today).length,
    states: countBy(reports, 'current_state'),
    semaforos: countBy(reports, 'semaforo'),
    secretaries: countBy(reports, 'tenant_name'),
    templates: countBy(reports, 'template_filename'),
    avgConfidence: average(reports.map((row) => Number(row.confidence_score))),
  };
}
