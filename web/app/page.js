'use client';

import { useState } from 'react';
import Header from '../components/Header';
import UploadCard from '../components/UploadCard';
import SubmitButton from '../components/SubmitButton';
import StatusCard from '../components/StatusCard';
import { processReport } from '../lib/api';

export default function Page() {
  const [photos, setPhotos] = useState([]);
  const [report, setReport] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const canSubmit = report.length === 1 && photos.length >= 1;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    const result = await processReport({ photos, report });
    setStatus(result);
    if (result?.ok) {
      setPhotos([]);
      setReport([]);
    }
    setLoading(false);
  }

  const missing = report.length === 0
    ? 'Falta la foto del informe'
    : photos.length === 0
      ? 'Falta al menos una foto del equipo'
      : '';

  return (
    <main className="screen">
      <Header />
      <UploadCard
        step="1"
        title="Fotografía el informe"
        hint="Debe verse completo, derecho y con buena luz."
        files={report}
        multiple={false}
        onChange={setReport}
        onUploadStart={() => setStatus(null)}
      />
      <UploadCard
        step="2"
        title="Fotografía el equipo"
        hint="Agrega una o más fotos donde se vea claramente."
        files={photos}
        multiple={true}
        onChange={setPhotos}
        onUploadStart={() => setStatus(null)}
      />
      <SubmitButton
        loading={loading}
        disabled={!canSubmit}
        missing={missing}
        onClick={handleSubmit}
      />
      <StatusCard status={status} />
    </main>
  );
}
