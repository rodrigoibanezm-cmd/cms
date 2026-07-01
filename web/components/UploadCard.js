// web/components/UploadCard.js
export default function UploadCard({ title, hint, files, multiple, onChange }) {
  function handleChange(event) {
    const selected = Array.from(event.target.files || []);
    onChange(multiple ? [...files, ...selected] : selected.slice(0, 1));
    event.target.value = '';
  }

  const countText = files.length === 0
    ? multiple ? 'Sin fotos cargadas' : 'Sin informe cargado'
    : multiple
      ? `${files.length} ${files.length === 1 ? 'foto' : 'fotos'}`
      : '1 informe seleccionado';

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
