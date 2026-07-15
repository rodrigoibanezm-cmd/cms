function countPending(reports) {
  return reports.filter((report) => (
    !['secretary_approved', 'closed'].includes(report.current_state)
  )).length;
}

function countWaiting(reports) {
  return reports.filter((report) => (
    ['assigned_to_secretary', 'secretary_review'].includes(report.current_state)
  )).length;
}

function countReview(reports) {
  return reports.filter((report) => (
    report.current_state === 'error' || Number(report.confidence_score || 100) < 60
  )).length;
}

export function summaryItems(reports) {
  return [
    ['▣', reports.length, 'OTs totales'],
    ['◷', countPending(reports), 'Pendientes'],
    ['♙', countWaiting(reports), 'Esperando administrativa'],
    ['!', countReview(reports), 'Requieren revisión'],
  ];
}
