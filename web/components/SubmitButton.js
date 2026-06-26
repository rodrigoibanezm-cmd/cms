// web/components/SubmitButton.js
export default function SubmitButton({ loading, disabled, onClick }) {
  return (
    <button
      className="submit"
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading ? 'Validando...' : 'Enviar informe'}
    </button>
  );
}
