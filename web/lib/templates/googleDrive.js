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

async function uploadXlsxBuffer(drive, folderId, filename, buffer) {
  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId], mimeType: XLSX_MIME },
    media: { mimeType: XLSX_MIME, body: Readable.from(buffer) },
    fields: 'id,name,webViewLink',
    supportsAllDrives: true
  });
  return res.data;
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
