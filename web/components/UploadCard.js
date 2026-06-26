// web/components/UploadCard.js
export default function UploadCard({ title, hint, files, multiple, onChange }) {
  function handleChange(event) {
    const selected = Array.from(event.target.files || []);
    onChange(multiple ? [...files, ...selected] : selected.slice(0, 1));
  }

  const countText = files.length === 0
    ? 'Sin fotos cargadas'
    : multiple
      ? `${files.length} foto(s) cargada(s)`
      : 'Informe cargado';

  return (
    <section className="card">
      <div>
        <h2>{title}</h2>
        <p>{hint}</p>
      </div>

      <label className="upload">
        <span>{files.length ? 'Agregar otra foto' : 'Agregar foto'}</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple={multiple}
          onChange={handleChange}
        />
      </label>

      <p className="count">{countText}</p>
    </section>
  );
}
