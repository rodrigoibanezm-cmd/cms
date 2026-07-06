// web/components/StatusCard.js
const styles = {
  green: ['\uD83D\uDFE2', 'Informe recibido'],
  yellow: ['\uD83D\uDFE1', 'Informe recibido'],
  red: ['\uD83D\uDD34', 'Foto no legible'],
};

function messageFor(status) {
  if (status.needs_retake) {
    return status.message || 'La foto no se pudo leer bien. Sube una imagen mas legible.';
  }
  return 'Informe enviado correctamente. Sera revisado por administracion.';
}

export default function StatusCard({ status }) {
  if (!status) return null;

  const [icon, title] = styles[status.color] || styles.green;

  return (
    <section className={`status ${status.color}`}>
      <div className="statusIcon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{messageFor(status)}</p>
      </div>
    </section>
  );
}
