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
import { fillSpecificFields } from './xls/specific_fields_fill.js';
import { addPhotos, addTextBlocks } from './xls/workbook_extras.js';

function outputFolderId() {
  return env('GOOGLE_DRIVE_OUTPUT_FOLDER_ID') || env('CANDIDATES_TEMPLATES_FOLDER_ID');
}

export async function publishGeneratedXls({ xls, extraction }) {
  const folderId = outputFolderId();
  if (!folderId) throw new Error('Falta carpeta Drive de salida');
  if (xls.excel_url) return xls;
  const uploaded = await uploadDriveFile({ buffer: xls.buffer, filename: xls.filename, folderId });
  console.log('[xls] uploaded', { ot: extraction?.ot, filename: xls.filename, driveFileId: uploaded.id, recovered: Boolean(extraction?.recovery?.applied) });
  return {
    ...xls,
    drive_file_id: uploaded.id,
    excel_url: uploaded.webViewLink,
  };
}

export async function generateFinalXls({ extraction, photos, publish = true }) {
  const templateFolderId = env('GOOGLE_DRIVE_TEMPLATES_FOLDER_ID') || env('BASES_FOLDER_ID');
  if (!templateFolderId) throw new Error('Falta carpeta Drive de plantillas');
  if (!extraction.template_filename) throw new Error('Extracción sin template_filename');

  console.log('[xls] start', { ot: extraction.ot, template: extraction.template_filename, recovered: Boolean(extraction.recovery?.applied) });

  const drive = driveClient();
  const template = await findFileByName(drive, templateFolderId, extraction.template_filename);
  if (!template) throw new Error(`Plantilla no encontrada: ${extraction.template_filename}`);

  const templateBuffer = await downloadDriveFile(template.id);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);

  const sheet = workbook.worksheets[0];
  const cellMap = getCellMap(extraction.template_key);
  if (!fillHeaderByMap(sheet, extraction, cellMap)) fillHeader(sheet, extraction);
  fillSpecificFields(sheet, extraction);
  if (!fillDispositionByMap(sheet, extraction, cellMap)) fillDisposition(sheet, extraction);
  fillInspection(sheet, extraction.inspeccion || []);
  if (!fillTextByMap(sheet, extraction, cellMap)) fillTextSections(sheet, extraction);
  fillParts(sheet, extraction.repuestos || []);
  addTextBlocks(workbook, extraction);
  addPhotos(workbook, photos);

  const outBuffer = await workbook.xlsx.writeBuffer();
  const xls = {
    filename: `${extraction.ot || 'SIN_OT'}_${Date.now()}_GENERADO.xlsx`,
    buffer: Buffer.from(outBuffer),
  };

  if (!publish) return xls;
  return publishGeneratedXls({ xls, extraction });
}
