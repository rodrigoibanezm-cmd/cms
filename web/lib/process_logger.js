export function logProcessStep(reportId, step, payload = {}) {
  console.log('[process-report]', JSON.stringify({ reportId, step, ...payload }));
}
