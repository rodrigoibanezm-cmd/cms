// web/components/StatusCard.js
const styles = {
  green: ['\uD83D\uDFE2', 'Informe recibido'],
  yellow: ['\uD83D\uDFE1', 'Informe recibido'],
  red: ['\uD83D\uDD34', 'Foto no legible'],
};

function messageFor(status) {
  if (status.needs_retake) {
    return status.message || 'La foto no se pudo leer bien. Sube una imagen m\u00e1s legible.';
  }
  return 'Informe enviado correctamente. Ser\u00e1 revisado por administraci\u00f3n.';
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
