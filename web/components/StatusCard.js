// web/components/StatusCard.js
const styles = {
  green: ['🟢', 'Informe recibido'],
  yellow: ['🟡', 'Informe recibido'],
  red: ['🔴', 'Informe enviado a revisión'],
};

function messageFor(status) {
  if (status.color === 'red') {
    return 'El informe fue procesado y quedó para revisión de administración.';
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
