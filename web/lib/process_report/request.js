function requireImage(file) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('El informe debe subirse como imagen.');
  }
}

function otFromFilename(filename) {
  const match = String(filename || '').match(/^(\d{4,6})\b/);
  return match?.[1] || '';
}

async function fileToBuffer(file) {
  return Buffer.from(await file.arrayBuffer());
}

function asImage(buffer, mimeType) {
  return {
    base64: buffer.toString('base64'),
    mediaType: mimeType || 'image/jpeg',
  };
}

async function photoPayloadFrom(files) {
  return Promise.all(files.map(async (file, index) => ({
    filename: file.name || `foto_${index + 1}.jpg`,
    mimeType: file.type || 'image/jpeg',
    buffer: await fileToBuffer(file),
  })));
}

export async function parseProcessReportRequest(request) {
  const form = await request.formData();
  const reportFile = form.get('report');
  const photoFiles = form.getAll('photos');

  if (!reportFile || !photoFiles.length) {
    return {
      error: true,
      status: 400,
      body: { ok: false, color: 'yellow', message: 'Falta informe o fotos de detalle.' },
    };
  }

  requireImage(reportFile);
  const sourceName = reportFile.name || 'informe';
  const userOt = String(form.get('ot') || '').trim();
  const otHint = userOt || otFromFilename(sourceName);
  const reportBuffer = await fileToBuffer(reportFile);

  return {
    error: false,
    sourceName,
    otHint,
    reportFile,
    reportBuffer,
    reportImage: asImage(reportBuffer, reportFile.type),
    photoPayload: await photoPayloadFrom(photoFiles),
  };
}
