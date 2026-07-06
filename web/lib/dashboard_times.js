function minutesBetween(start, end) {
  if (!start || !end) return null;
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 60000));
}

function average(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return null;
  return Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length);
}

export function buildDashboardTimes(reports) {
  const done = reports.filter((row) => row.current_state === 'secretary_approved');
  return {
    admin: average(reports.map((row) => minutesBetween(row.created_at, row.assigned_at))),
    secretary: average(reports.map((row) => minutesBetween(row.assigned_at, row.secretary_approved_at))),
    total: average(done.map((row) => minutesBetween(row.created_at, row.secretary_approved_at))),
    oldestOpen: reports.find((row) => !['secretary_approved', 'closed'].includes(row.current_state)),
  };
}
