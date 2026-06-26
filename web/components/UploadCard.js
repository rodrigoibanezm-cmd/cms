// web/components/UploadCard.js
export default function UploadCard({ title, hint, files, onChange }) {
  function handleChange(event) {
    onChange(Array.from(event.target.files || []));
  }

  return (
    <section className="card">
      <div>
        <h2>{title}</h2>
        <p>{hint}</p>
      </div>

      <label className="upload">
        <span>Agregar foto</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleChange}
        />
      </label>

      <p className="count">
        {files.length === 0
          ? 'Sin fotos cargadas'
          : `${files.length} foto(s) cargada(s)`}
      </p>
    </section>
  );
}
