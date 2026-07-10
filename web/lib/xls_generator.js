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
import { styleEditableCells } from './xls/input_cell_style.js';
import { sanitizeTemplateWorkbook } from './xls/template_sanitize.js';

const SHORTCUT_MIME = 'application/vnd.google-apps.shortcut';
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function outputFolderId() {
  return env('GOOGLE_DRIVE_OUTPUT_FOLDER_ID') || env('CANDIDATES_TEMPLATES_FOLDER_ID');
}

function isNativeXlsxTemplate(template) {
  if (!template?.mimeType) return true;
  if (template.mimeType === XLSX_MIME) return true;
  return template.mimeType === SHORTCUT_MIME && template.shortcutDetails?.targetMimeType === XLSX_MIME;
}

async function selectedTemplate(extraction, folderId) {
  if (extraction.template_drive_file_id) return { id: extraction.template_drive_file_id, name: extraction.template_filename };
  return findFileByName(driveClient(), folderId, extraction.template_filename);
}

async function loadTemplateWorkbook(buffer, filename) {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch (err) {
    console.error('[xls] invalid native xlsx template', { filename, error: err.message });
    throw new Error(`La base seleccionada no es un XLSX compatible: ${filename}`);
  }
  if (!workbook.worksheets[0]) throw new Error(`La base seleccionada no tiene hojas: ${filename}`);
  return workbook;
}

function normalizeMainSheetName(sheet) {
  const clean = String(sheet?.name || '').trim();
  if (clean && clean !== sheet.name) sheet.name = clean;
}

export async function publishGeneratedXls({ xls, extraction }) {
  const folderId = outputFolderId();
  if (!folderId) throw new Error('Falta carpeta Drive de salida');
  if (xls.excel_url) return xls;
  const uploaded = await uploadDriveFile({ buffer: xls.buffer, filename: xls.filename, folderId });
  console.log('[xls] uploaded', { ot: extraction?.ot, filename: xls.filename, driveFileId: uploaded.id, recovered: Boolean(extraction?.recovery?.applied) });
  return { ...xls, drive_file_id: uploaded.id, excel_url: uploaded.webViewLink };
}

export async function generateFinalXls({ extraction, photos, publish = true }) {
  const templateFolderId = env('GOOGLE_DRIVE_TEMPLATES_FOLDER_ID') || env('BASES_FOLDER_ID');
  if (!templateFolderId) throw new Error('Falta carpeta Drive de plantillas');
  if (!extraction.template_filename) throw new Error('Extracción sin template_filename');

  console.log('[xls] start', { ot: extraction.ot, template: extraction.template_filename, recovered: Boolean(extraction.recovery?.applied) });

  const template = await selectedTemplate(extraction, templateFolderId);
  if (!template) throw new Error(`Plantilla no encontrada: ${extraction.template_filename}`);
  if (!isNativeXlsxTemplate(template)) throw new Error(`La base debe ser un XLSX real, no una Hoja de Google: ${template.name}`);

  const templateBuffer = await downloadDriveFile(template.id);
  const workbook = await loadTemplateWorkbook(templateBuffer, template.name);
  sanitizeTemplateWorkbook(workbook);
  const sheet = workbook.worksheets[0];
  normalizeMainSheetName(sheet);
  const cellMap = getCellMap(extraction.template_key);
  if (!fillHeaderByMap(sheet, extraction, cellMap)) fillHeader(sheet, extraction);
  fillSpecificFields(sheet, extraction);
  if (!fillDispositionByMap(sheet, extraction, cellMap)) fillDisposition(sheet, extraction);
  fillInspection(sheet, extraction.inspeccion || []);
  if (!fillTextByMap(sheet, extraction, cellMap)) fillTextSections(sheet, extraction);
  fillParts(sheet, extraction.repuestos || []);
  addTextBlocks(workbook, extraction);
  addPhotos(workbook, photos);
  styleEditableCells(sheet);

  const outBuffer = await workbook.xlsx.writeBuffer();
  const xls = { filename: `${extraction.ot || 'SIN_OT'}_${Date.now()}_GENERADO.xlsx`, buffer: Buffer.from(outBuffer) };
  return publish ? publishGeneratedXls({ xls, extraction }) : xls;
}
