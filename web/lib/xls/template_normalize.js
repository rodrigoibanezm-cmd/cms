const SHEETS_MIME = 'application/vnd.google-apps.spreadsheet';
const SHORTCUT_MIME = 'application/vnd.google-apps.shortcut';
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

async function fileMeta(drive, fileId) {
  const res = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType,shortcutDetails',
    supportsAllDrives: true,
  });
  return res.data || {};
}

function resolvedFile(meta) {
  if (meta.mimeType !== SHORTCUT_MIME) return meta;
  return {
    id: meta.shortcutDetails?.targetId,
    name: meta.name,
    mimeType: meta.shortcutDetails?.targetMimeType,
  };
}

async function copyAsSheet(drive, fileId, filename) {
  const res = await drive.files.copy({
    fileId,
    requestBody: {
      name: `NORMALIZE_${Date.now()}_${filename}`,
      mimeType: SHEETS_MIME,
    },
    fields: 'id',
    supportsAllDrives: true,
  });
  return res.data.id;
}

async function exportAsXlsx(drive, sheetId) {
  const res = await drive.files.export(
    { fileId: sheetId, mimeType: XLSX_MIME },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data);
}

export async function normalizeTemplateBuffer(drive, fileId, filename) {
  const meta = resolvedFile(await fileMeta(drive, fileId));
  if (!meta.id) throw new Error('Plantilla Drive sin archivo destino');
  const sheetId = await copyAsSheet(drive, meta.id, filename);
  try {
    return await exportAsXlsx(drive, sheetId);
  } finally {
    await drive.files.delete({ fileId: sheetId, supportsAllDrives: true }).catch(console.error);
  }
}
