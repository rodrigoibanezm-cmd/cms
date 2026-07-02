// web/components/StatusCard.js
const styles = {
  green: ['🟢', 'Informe recibido'],
  yellow: ['🟡', 'Informe recibido'],
  red: ['🔴', 'Tomar otra foto'],
};

function messageFor(status) {
  if (status.color === 'red') {
    return status.message || 'No se pudo validar el informe. Toma otra foto completa y legible.';
  }
  return 'Informe enviado correctamente. Será revisado por administración.';
}

export default function StatusCard({ status }) {
  if (!status) return null;

  const [icon, title] = styles[status.color] || styles.yellow;

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
