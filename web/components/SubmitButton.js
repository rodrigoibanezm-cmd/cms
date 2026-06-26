// web/components/SubmitButton.js
export default function SubmitButton({ loading, onClick }) {
  return (
    <button className="submit" disabled={loading} onClick={onClick}>
      {loading ? 'Validando...' : 'Enviar informe'}
    </button>
  );
}
