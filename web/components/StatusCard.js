// web/components/StatusCard.js
const styles = {
  green: ['🟢', 'Informe recibido'],
  yellow: ['🟡', 'Informe recibido'],
  red: ['🔴', 'Foto no legible'],
  error: ['🔴', 'No se pudo procesar'],
};

function statusKind(status) {
  if (status?.ok === false) return 'error';
  return status?.color || 'green';
}

function titleFor(status) {
  const kind = statusKind(status);
  return styles[kind] || styles.green;
}

function messageFor(status) {
  if (status?.ok === false) return status.message || status.error || 'No se pudo procesar el informe.';
  if (status?.needs_retake) return status.message || 'La foto no se pudo leer bien. Sube una imagen mas legible.';
  return 'Informe enviado correctamente. Sera revisado por administracion.';
}

export default function StatusCard({ status }) {
  if (!status) return null;

  const kind = statusKind(status);
  const [icon, title] = titleFor(status);

  return (
    <section className={`status ${kind}`}>
      <div className="statusIcon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{messageFor(status)}</p>
      </div>
    </section>
  );
}