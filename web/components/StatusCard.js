// web/components/StatusCard.js
const styles = {
  green: ['🟢', 'Procesado'],
  yellow: ['🟡', 'Procesado con revisión'],
  red: ['🔴', 'No procesado'],
};

export default function StatusCard({ status }) {
  if (!status) return null;

  const successTitle = status.excel_url ? 'Excel generado' : null;
  const [icon, fallbackTitle] = styles[status.color] || styles.yellow;
  const title = successTitle || fallbackTitle;

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
