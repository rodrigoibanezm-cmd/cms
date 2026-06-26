// web/app/page.js
'use client';

import { useState } from 'react';
import Header from '../components/Header';
import UploadCard from '../components/UploadCard';
import SubmitButton from '../components/SubmitButton';
import StatusCard from '../components/StatusCard';
import { mockValidate } from '../lib/api';

export default function Page() {
  const [photos, setPhotos] = useState([]);
  const [report, setReport] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const result = await mockValidate({ photos, report });
    setStatus(result);
    setLoading(false);
  }

  return (
    <main className="screen">
      <Header />
      <UploadCard
        title="Fotos del equipo"
        hint="Sube fotos claras del equipo inspeccionado."
        files={photos}
        onChange={setPhotos}
      />
      <UploadCard
        title="Foto del informe"
        hint="Toma una foto completa y legible del informe."
        files={report}
        onChange={setReport}
      />
      <SubmitButton loading={loading} onClick={handleSubmit} />
      <StatusCard status={status} />
    </main>
  );
}
