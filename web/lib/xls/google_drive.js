import { google } from 'googleapis';
import { Readable } from 'stream';

export function env(name) {
  return process.env[name] || '';
}

function parseServiceAccount() {
  const raw = env('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('Falta GOOGLE_SERVICE_ACCOUNT_JSON');

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON no es JSON válido');
  }
}

function oauthAuth() {
  const clientId = env('GOOGLE_CLIENT_ID');
  const clientSecret = env('GOOGLE_CLIENT_SECRET');
  const refreshToken = env('GOOGLE_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) return null;

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

function serviceAccountAuth() {
  const credentials = parseServiceAccount();
  return new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/drive'] });
}

function googleAuthClient() {
  if (env('GOOGLE_DRIVE_AUTH_MODE') === 'service_account') return serviceAccountAuth();
  const oauth = oauthAuth();
  if (oauth) return oauth;
  if (env('GOOGLE_SERVICE_ACCOUNT_JSON')) return serviceAccountAuth();
  throw new Error('Falta autenticación Google Drive');
}

export function driveClient() {
  return google.drive({ version: 'v3', auth: googleAuthClient() });
}

export async function findFileByName(drive, folderId, name) {
  const cleanName = name.replace(' (1).xlsx', '.xlsx');
  const names = [...new Set([name, cleanName])];

  for (const candidate of names) {
    const safeName = candidate.replace(/'/g, "\\'");
    const res = await drive.files.list({
      q: `'${folderId}' in parents and name='${safeName}' and trashed=false`,
      fields: 'files(id,name)',
      pageSize: 1,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const file = res.data.files?.[0] || null;
    if (file) return file;
  }
  return null;
}

export async function downloadDriveFile(fileId) {
  const drive = driveClient();
  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data);
}

export async function uploadDriveFile({ buffer, filename, folderId, mimeType }) {
  const drive = driveClient();
  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: {
      mimeType: mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: Readable.from(Buffer.from(buffer)),
    },
    fields: 'id,webViewLink',
    supportsAllDrives: true,
  });
  return res.data;
}
