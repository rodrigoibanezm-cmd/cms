// web/app/page.js
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
    setLoading(false);
  }

  return (
    <main className="screen">
      <Header />
      <UploadCard
        title="Fotos de detalle"
        hint="Agrega todas las fotos necesarias del equipo."
        files={photos}
        multiple={true}
        onChange={setPhotos}
      />
      <UploadCard
        title="Foto del informe"
        hint="Sube una sola foto completa y legible del informe."
        files={report}
        multiple={false}
        onChange={setReport}
      />
      <SubmitButton
        loading={loading}
        disabled={!canSubmit}
        onClick={handleSubmit}
      />
      <StatusCard status={status} />
    </main>
  );
}
