export async function processReport({ photos, report }) {
  const formData = new FormData();

  if (report?.[0]) formData.append('report', report[0]);
  photos.forEach((photo) => formData.append('photos', photo));

  const response = await fetch('/api/process-report', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return data || { color: 'red', message: 'No se pudo procesar el informe.' };
  }

  return data;
}
