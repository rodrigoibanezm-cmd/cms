import { driveClient, env, uploadDriveFile } from './xls/google_drive.js';

const SHORTCUT_MIME = 'application/vnd.google-apps.shortcut';
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function templateFolderId() {
  return env('GOOGLE_DRIVE_TEMPLATES_FOLDER_ID') || env('BASES_FOLDER_ID');
}

function assertFolder() {
  const folderId = templateFolderId();
  if (!folderId) throw new Error('Falta carpeta Drive de plantillas');
  return folderId;
}

function isXlsxName(name) {
  return String(name || '').toLowerCase().endsWith('.xlsx');
}

function safeTemplateName(name) {
  return String(name || 'plantilla.xlsx').replace(/[^a-zA-Z0-9_. -]/g, '_');
}

function isNativeXlsxFile(file) {
  if (file.mimeType === XLSX_MIME) return true;
  if (file.mimeType !== SHORTCUT_MIME) return false;
  return file.shortcutDetails?.targetMimeType === XLSX_MIME;
}

export async function listTemplates() {
  const drive = driveClient();
  const folderId = assertFolder();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id,name,mimeType,shortcutDetails,modifiedTime)',
    orderBy: 'name',
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return (res.data.files || [])
    .filter((file) => isXlsxName(file.name) && isNativeXlsxFile(file))
    .map((file) => ({ id: file.id, name: file.name, modifiedTime: file.modifiedTime }));
}

export async function uploadTemplateFile(file) {
  if (!file || !file.size) return null;
  const filename = safeTemplateName(file.name);
  if (!isXlsxName(filename)) throw new Error('La plantilla debe ser XLSX');
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadDriveFile({
    buffer,
    filename,
    folderId: assertFolder(),
    mimeType: file.type || XLSX_MIME,
  });
  return { filename, driveFileId: uploaded.id, url: uploaded.webViewLink };
}