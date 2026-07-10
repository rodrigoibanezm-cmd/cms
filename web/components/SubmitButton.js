export default function SubmitButton({ loading, disabled, missing, onClick }) {
  return (
    <div className="submitArea">
      <button
        className="submit"
        disabled={loading || disabled}
        onClick={onClick}
      >
        {loading ? 'Enviando informe…' : 'Enviar informe'}
      </button>
      <p className={'submitHint ' + (!disabled ? 'submitReady' : '')}>
        {loading
          ? 'No cierres esta pantalla.'
          : disabled
            ? missing
            : 'Todo listo para enviar'}
      </p>
    </div>
  );
}
