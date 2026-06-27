const { google } = require('googleapis');
const { Readable } = require('stream');

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

function parseFolderId(value) {
  const text = String(value || '').trim();
  const match = text.match(/folders\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : text;
}

function getDrive() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(raw),
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  return google.drive({ version: 'v3', auth });
}

async function listChildren(drive, folderId, mimeType) {
  const query = [`'${folderId}' in parents`, 'trashed = false'];
  if (mimeType) query.push(`mimeType = '${mimeType}'`);
  const files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: query.join(' and '),
      fields: 'nextPageToken,files(id,name,mimeType,size,webViewLink)',
      pageSize: 100,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    files.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return files;
}

async function findChildFolder(drive, parentFolderId, name) {
  const folders = await listChildren(drive, parentFolderId, FOLDER_MIME);
  const wanted = String(name).trim().toUpperCase();
  const found = folders.find((f) => f.name.toUpperCase() === wanted);
  if (!found) throw new Error(`No existe carpeta de familia: ${name}`);
  return found;
}

async function downloadFileBuffer(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data);
}

function isServiceAccountQuotaError(error) {
  return String(error && error.message || '').includes('Service Accounts do not have storage quota');
}

function serviceAccountQuotaMessage() {
  return [
    'No se pudo crear el XLSX en Drive: la Service Account no tiene cuota propia.',
    'Solución: BASES_FOLDER_ID debe ser una carpeta dentro de una Unidad compartida de Google Drive',
    'y la Service Account debe tener permiso de Content manager/Manager.',
    'Alternativa: usar OAuth delegation de usuario en vez de Service Account.'
  ].join(' ');
}

async function updateXlsxBuffer(drive, fileId, buffer) {
  const res = await drive.files.update({
    fileId,
    media: { mimeType: XLSX_MIME, body: Readable.from(buffer) },
    fields: 'id,name,webViewLink',
    supportsAllDrives: true
  });
  return res.data;
}

async function createXlsxBuffer(drive, folderId, filename, buffer) {
  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId], mimeType: XLSX_MIME },
    media: { mimeType: XLSX_MIME, body: Readable.from(buffer) },
    fields: 'id,name,webViewLink',
    supportsAllDrives: true
  });
  return res.data;
}

async function uploadXlsxBuffer(drive, folderId, filename, buffer) {
  const existing = (await listChildren(drive, folderId, XLSX_MIME))
    .find((file) => file.name === filename);

  try {
    if (existing) return updateXlsxBuffer(drive, existing.id, buffer);
    return createXlsxBuffer(drive, folderId, filename, buffer);
  } catch (error) {
    if (isServiceAccountQuotaError(error)) throw new Error(serviceAccountQuotaMessage());
    throw error;
  }
}

module.exports = {
  XLSX_MIME,
  parseFolderId,
  getDrive,
  listChildren,
  findChildFolder,
  downloadFileBuffer,
  uploadXlsxBuffer
};
