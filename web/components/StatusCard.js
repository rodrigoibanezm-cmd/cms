// web/components/StatusCard.js
const styles = {
  green: ['🟢', 'Aprobado'],
  yellow: ['🟡', 'Revisar datos'],
  red: ['🔴', 'Tomar foto nuevamente'],
};

export default function StatusCard({ status }) {
  if (!status) return null;

  const [icon, title] = styles[status.color] || styles.yellow;

  return (
    <section className={`status ${status.color}`}>
      <div className="statusIcon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{status.message}</p>
        {status.excel_url ? (
          <p>
            <a href={status.excel_url} target="_blank" rel="noreferrer">
              Abrir Excel generado
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
