'use client';

function previewUrl(file) {
  return URL.createObjectURL(file);
}

export default function UploadCard({ step, title, hint, files, multiple, onChange }) {
  function handleChange(event) {
    const selected = Array.from(event.target.files || []);
    onChange(multiple ? [...files, ...selected] : selected.slice(0, 1));
    event.target.value = '';
  }

  function removeFile(indexToRemove) {
    onChange(files.filter((_, index) => index !== indexToRemove));
  }

  const ready = files.length > 0;
  const countText = ready
    ? multiple ? files.length + (files.length === 1 ? ' foto lista' : ' fotos listas') : 'Informe listo'
    : 'Pendiente';
  const buttonText = ready && multiple ? 'Agregar otra foto' : 'Tomar foto';

  return (
    <section className={'card ' + (ready ? 'cardReady' : '')}>
      <div className="cardTitle">
        <span className="step">{ready ? '✓' : step}</span>
        <div>
          <h2>{title}</h2>
          <p>{hint}</p>
        </div>
      </div>

      {(multiple || !ready) ? (
        <label className="upload">
          <span className="camera" aria-hidden="true">●</span>
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

      {ready ? (
        <div className="previewGrid">
          {files.map((file, index) => (
            <div className="previewItem" key={file.name + '-' + file.lastModified + '-' + index}>
              <img src={previewUrl(file)} alt="Foto seleccionada" />
              <button
                type="button"
                className="previewRemove"
                aria-label="Eliminar foto"
                onClick={() => removeFile(index)}
              >×</button>
            </div>
          ))}
        </div>
      ) : null}

      <p className={'count ' + (ready ? 'ready' : '')}>{countText}</p>
    </section>
  );
}
