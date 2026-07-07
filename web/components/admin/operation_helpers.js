export function confidenceInfo(score) {
  if (score === null || score === undefined) {
    return { label: 'Sin dato', detail: 'Confianza IA', tone: 'muted' };
  }
  const value = Number(score);
  if (value >= 85) return { label: `Alta ${value}%`, detail: 'Revisión simple', tone: 'green' };
  if (value >= 60) return { label: `Media ${value}%`, detail: 'Revisión sugerida', tone: 'yellow' };
  return { label: `Baja ${value}%`, detail: 'Revisión requerida', tone: 'red' };
}

export function workflowInfo(value) {
  const map = {
    processing: ['Procesando', 'blue'],
    admin_queue: ['Pendiente', 'yellow'],
    assigned_to_secretary: ['Esperando secretaria', 'yellow'],
    secretary_review: ['En revisión', 'blue'],
    secretary_approved: ['Aprobada', 'green'],
    closed: ['Cerrada', 'green'],
    error: ['Requiere revisión', 'red'],
  };
  const entry = map[value] || [value || '-', 'muted'];
  return { label: entry[0], tone: entry[1] };
}

export function pdfReady(report) {
  return Boolean(report.secretary_approved_at || report.closed_at);
}

export function clientLabel(report) {
  return report.client_name || report.source_name || report.template_filename || '-';
}

export function dateLabel(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-CL');
}

export function waitInfo(report) {
  if (['secretary_approved', 'closed'].includes(report.current_state)) {
    return { label: '-', detail: 'Completada', tone: 'muted' };
  }
  const base = report.last_workflow_event_at || report.assigned_at || report.created_at;
  if (!base) return { label: '-', detail: 'Sin fecha', tone: 'muted' };
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(base).getTime()) / 60000));
  const label = formatMinutes(minutes);
  return { label, detail: slaLabel(report.sla_due_at), tone: waitTone(minutes) };
}

function formatMinutes(minutes) {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${mins} min`;
  return `${mins} min`;
}

function slaLabel(value) {
  if (!value) return 'SLA: -';
  const hours = Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 3600000));
  return `SLA: ${hours} h`;
}

function waitTone(minutes) {
  if (minutes >= 720) return 'red';
  if (minutes >= 240) return 'yellow';
  return 'green';
}