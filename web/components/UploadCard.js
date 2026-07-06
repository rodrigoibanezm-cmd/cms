// web/components/UploadCard.js
'use client';

function previewUrl(file) {
  return URL.createObjectURL(file);
}

export default function UploadCard({ title, hint, files, multiple, onChange }) {
  function handleChange(event) {
    const selected = Array.from(event.target.files || []);
    onChange(multiple ? [...files, ...selected] : selected.slice(0, 1));
    event.target.value = '';
  }

  function removeFile(indexToRemove) {
    onChange(files.filter((_, index) => index !== indexToRemove));
  }

  const countText = files.length === 0
    ? multiple ? 'Sin fotos cargadas' : 'Sin informe cargado'
    : multiple
      ? `${files.length} ${files.length === 1 ? 'foto' : 'fotos'}`
      : '1 informe seleccionado';

  const showUpload = multiple || files.length === 0;
  const buttonText = multiple
    ? files.length ? 'Agregar otra foto' : 'Agregar foto'
    : 'Agregar informe';

  return (
    <section className="card">
      <div>
        <h2>{title}</h2>
        <p>{hint}</p>
      </div>

      {showUpload ? (
        <label className="upload">
          <span>{buttonText}</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple={multiple}
            onChange={handleChange}
          />
        </label>
      ) : null}

      {files.length ? (
        <div className="previewGrid">
          {files.map((file, index) => (
            <div className="previewItem" key={`${file.name}-${file.lastModified}-${index}`}>
              <img src={previewUrl(file)} alt={file.name || 'preview'} />
              <button
                type="button"
                className="previewRemove"
                onClick={() => removeFile(index)}
              >
                x
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <p className="count">{countText}</p>
    </section>
  );
}
