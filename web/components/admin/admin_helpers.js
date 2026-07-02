export function semaforoClass(styles, value) {
  if (value === 'VERDE') return `${styles.pill} ${styles.green}`;
  if (value === 'ROJO') return `${styles.pill} ${styles.red}`;
  return `${styles.pill} ${styles.yellow}`;
}

export function reviewLabel(value) {
  if (value === 'approved') return 'Aprobado';
  if (value === 'recover') return 'Corrección IA';
  if (value === 'review') return 'Revisar';
  if (value === 'rejected') return 'Rechazado';
  return value || 'Pendiente';
}
