import { env, downloadDriveFile, driveClient, findFileByName, uploadDriveFile } from '../xls/google_drive.js';
import { loadTemplateWorkbook } from '../xls/template_loader.js';
import { fillEsmerilFinal } from './esmeril_fill.js';
import { addEsmerilPhotos } from './esmeril_photos.js';

const TEMPLATE = 'ESMERIL_FINAL.xlsx';

function folder(name, fallback) {
  return env(name) || env(fallback);
}

export async function generateEsmerilFinal({ extraction, photos }) {
  const bases = folder('GOOGLE_DRIVE_TEMPLATES_FOLDER_ID', 'BASES_FOLDER_ID');
  const output = folder('GOOGLE_DRIVE_OUTPUT_FOLDER_ID', 'CANDIDATES_TEMPLATES_FOLDER_ID');
  if (!bases || !output) throw new Error('Faltan carpetas Drive para informe final');
  const template = await findFileByName(driveClient(), bases, TEMPLATE);
  if (!template) throw new Error(`Plantilla no encontrada: ${TEMPLATE}`);
  const workbook = await loadTemplateWorkbook(await downloadDriveFile(template.id), template.name);
  fillEsmerilFinal(workbook, extraction);
  addEsmerilPhotos(workbook, photos);
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const filename = `${extraction.ot || 'SIN_OT'}_${Date.now()}_INFORME_FINAL.xlsx`;
  const uploaded = await uploadDriveFile({ buffer, filename, folderId: output });
  return { filename, buffer, drive_file_id: uploaded.id, excel_url: uploaded.webViewLink };
}
