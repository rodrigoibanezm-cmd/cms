import ExcelJS from 'exceljs';
import { getCellMap } from './xls_cell_maps.js';
import {
  downloadDriveFile,
  driveClient,
  env,
  findFileByName,
  uploadDriveFile,
} from './xls/google_drive.js';
import { fillHeader, fillHeaderByMap } from './xls/header_fill.js';
import { fillInspection } from './xls/inspection_fill.js';
import { fillDisposition, fillDispositionByMap } from './xls/status_fill.js';
import { fillTextByMap, fillTextSections } from './xls/text_fill.js';
import { fillParts } from './xls/parts_fill.js';
import { addPhotos, addTextBlocks } from './xls/workbook_extras.js';

export async function generateFinalXls({ extraction, photos }) {
  const templateFolderId = env('GOOGLE_DRIVE_TEMPLATES_FOLDER_ID') || env('BASES_FOLDER_ID');
  const outputFolderId = env('GOOGLE_DRIVE_OUTPUT_FOLDER_ID') || env('CANDIDATES_TEMPLATES_FOLDER_ID');
  if (!templateFolderId || !outputFolderId) throw new Error('Faltan IDs de carpetas Drive');
  if (!extraction.template_filename) throw new Error('Extracción sin template_filename');

  const drive = driveClient();
  const template = await findFileByName(drive, templateFolderId, extraction.template_filename);
  if (!template) throw new Error(`Plantilla no encontrada: ${extraction.template_filename}`);

  const templateBuffer = await downloadDriveFile(template.id);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);

  const sheet = workbook.worksheets[0];
  const cellMap = getCellMap(extraction.template_key);
  if (!fillHeaderByMap(sheet, extraction, cellMap)) fillHeader(sheet, extraction);
  if (!fillDispositionByMap(sheet, extraction, cellMap)) fillDisposition(sheet, extraction);
  fillInspection(sheet, extraction.inspeccion || []);
  if (!fillTextByMap(sheet, extraction, cellMap)) fillTextSections(sheet, extraction);
  fillParts(sheet, extraction.repuestos || []);
  addTextBlocks(workbook, extraction);
  addPhotos(workbook, photos);

  const outBuffer = await workbook.xlsx.writeBuffer();
  const filename = `${extraction.ot || 'SIN_OT'}_${Date.now()}_GENERADO.xlsx`;
  const uploaded = await uploadDriveFile({ buffer: outBuffer, filename, folderId: outputFolderId });

  return {
    filename,
    drive_file_id: uploaded.id,
    excel_url: uploaded.webViewLink,
    buffer: Buffer.from(outBuffer),
  };
}
