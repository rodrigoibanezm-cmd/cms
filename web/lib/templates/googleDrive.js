const { google } = require('googleapis');
const { Readable } = require('stream');

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

function parseFolderId(value) {
  const text = String(value || '').trim();
  const match = text.match(/folders\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : text;
}

function baseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL;
  const proto = req?.headers?.['x-forwarded-proto'] || 'https';
  const host = req?.headers?.host;
  return host ? `${proto}://${host}` : 'http://localhost:3000';
}

function redirectUri(req) {
  return `${baseUrl(req)}/api/auth/google/callback`;
}

function oauthClient(req) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri(req));
}

function getDrive(req) {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    const auth = oauthClient(req);
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    return google.drive({ version: 'v3', auth });
  }

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Missing Google credentials');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(raw),
    scopes: [DRIVE_SCOPE]
  });
  return google.drive({ version: 'v3', auth });
}

function authUrl(req) {
  return oauthClient(req).generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [DRIVE_SCOPE]
  });
}

async function exchangeCode(req, code) {
  const client = oauthClient(req);
  const { tokens } = await client.getToken(code);
  return tokens;
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
  DRIVE_SCOPE,
  parseFolderId,
  getDrive,
  authUrl,
  exchangeCode,
  listChildren,
  findChildFolder,
  downloadFileBuffer,
  uploadXlsxBuffer
};
