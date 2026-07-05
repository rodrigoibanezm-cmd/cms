export function semaforoClass(styles, value) {
  if (value === 'VERDE') return `${styles.pill} ${styles.green}`;
  if (value === 'ROJO') return `${styles.pill} ${styles.red}`;
  return `${styles.pill} ${styles.yellow}`;
}

export function workflowLabel(value) {
  if (value === 'processing') return 'Procesando';
  if (value === 'admin_queue') return 'Cola admin';
  if (value === 'assigned_to_secretary') return 'Asignada';
  if (value === 'secretary_review') return 'En revisión';
  if (value === 'secretary_approved') return 'Aprobada';
  if (value === 'closed') return 'Cerrada';
  if (value === 'error') return 'Error';
  return value || '-';
}

export function priorityLabel(value) {
  if (value === 'high') return 'Alta';
  if (value === 'low') return 'Baja';
  return 'Normal';
}

export function dateLabel(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-CL');
}

export function pdfReady(report) {
  return Boolean(report.secretary_approved_at || report.closed_at);
}
