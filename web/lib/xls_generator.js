import ExcelJS from 'exceljs';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { getCellMap } from './xls_cell_maps.js';

function env(name) {
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

function getAuth() {
  return oauthAuth() || serviceAccountAuth();
}

function driveClient() {
  return google.drive({ version: 'v3', auth: getAuth() });
}

async function findFileByName(drive, folderId, name) {
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

async function downloadDriveFile(fileId) {
  const drive = driveClient();
  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data);
}

async function uploadDriveFile({ buffer, filename, folderId }) {
  const drive = driveClient();
  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: Readable.from(Buffer.from(buffer)),
    },
    fields: 'id,webViewLink',
    supportsAllDrives: true,
  });
  return res.data;
}

function text(v) {
  return String(v ?? '').trim();
}

function norm(v) {
  return text(v)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

function cellText(cell) {
  const value = cell.value;
  if (value?.richText) return value.richText.map((r) => r.text).join('');
  return value;
}

function writableCell(cell) {
  return cell.isMerged && cell.master ? cell.master : cell;
}

function setCell(sheet, address, value) {
  if (!address || !text(value)) return;
  writableCell(sheet.getCell(address)).value = value;
}

function markCell(sheet, address) {
  if (!address) return;
  writableCell(sheet.getCell(address)).value = 'X';
}

function findCellByLabel(sheet, labels, options = {}) {
  const wanted = labels.map(norm);
  const maxRow = options.maxRow || Number.MAX_SAFE_INTEGER;
  let found = null;

  for (const exactOnly of [true, false]) {
    sheet.eachRow((row, rowNumber) => {
      if (found || rowNumber > maxRow) return;
      row.eachCell((cell, colNumber) => {
        const value = norm(cellText(cell));
        const match = exactOnly
          ? wanted.some((label) => value === label)
          : wanted.some((label) => value.includes(label));
        if (!found && match) found = { row: rowNumber, col: colNumber };
      });
    });
    if (found || options.exactOnly) break;
  }

  return found;
}

function writableCellToRight(sheet, row, col) {
  for (let offset = 1; offset <= 6; offset++) {
    const cell = sheet.getCell(row, col + offset);
    if (!cell.isMerged || cell.master?.address === cell.address) return cell;
  }
  return sheet.getCell(row, col + 1);
}

function setBesideLabel(sheet, labels, value, options = {}) {
  if (!text(value)) return;
  const found = findCellByLabel(sheet, labels, options);
  if (!found) return;
  writableCellToRight(sheet, found.row, found.col).value = value;
}

function setBelowLabel(sheet, labels, value, offset = 1) {
  if (!text(value)) return;
  const found = findCellByLabel(sheet, labels);
  if (!found) return;

  const target = sheet.getCell(found.row + offset, found.col);
  target.value = value;
  target.alignment = { wrapText: true, vertical: 'top' };
}

function fillHeaderByMap(sheet, data, map) {
  if (!map?.header) return false;
  Object.entries(map.header).forEach(([field, address]) => setCell(sheet, address, data[field]));
  return true;
}

function fillHeader(sheet, data) {
  const top = { maxRow: 14 };
  setBesideLabel(sheet, ['OT', 'O.T', 'ORDEN DE TRABAJO'], data.ot, top);
  setBesideLabel(sheet, ['TECNICO', 'TÉCNICO', 'MECÁNICO ESPECIALISTA'], data.tecnico, top);
  setBesideLabel(sheet, ['CLIENTE'], data.cliente, top);
  setBesideLabel(sheet, ['AREA USUARIA', 'ÁREA USUARIA'], data.area_usuaria, top);
  setBesideLabel(sheet, ['ROTULO', 'RÓTULO'], data.rotulo, top);
  setBesideLabel(sheet, ['FECHA EVALUACION', 'FECHA DE EVALUACION'], data.fecha_evaluacion, top);
  setBesideLabel(sheet, ['MARCA'], data.marca, top);
  setBesideLabel(sheet, ['MODELO'], data.modelo, top);
  setBesideLabel(sheet, ['SERIE'], data.serie, top);
  setBesideLabel(sheet, ['CAPACIDAD'], data.capacidad, top);
}

function findHeaderColumns(sheet) {
  let cols = null;
  sheet.eachRow((row, rowNumber) => {
    if (cols) return;
    const found = {};
    row.eachCell((cell, colNumber) => {
      const value = norm(cellText(cell));
      if (value.includes('DESCRIP')) found.item = colNumber;
      if (value === 'CUMPLE') found.cumple = colNumber;
      if (value.includes('NO CUMPLE')) found.noCumple = colNumber;
      if (value.includes('NO APLICA')) found.noAplica = colNumber;
      if (value.includes('OBSERV')) found.obs = colNumber;
      if (value.includes('REPAR')) found.reparacion = colNumber;
    });
    if (found.item && found.cumple && found.noCumple && found.noAplica) {
      cols = { row: rowNumber, ...found };
    }
  });
  return cols;
}

function fillInspection(sheet, inspeccion = []) {
  const cols = findHeaderColumns(sheet);
  if (!cols) return;

  for (const item of inspeccion) {
    let targetRow = null;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= cols.row || targetRow) return;
      const label = norm(cellText(row.getCell(cols.item)));
      if (label && label === norm(item.item)) targetRow = rowNumber;
    });
    if (!targetRow) continue;

    const markCol = item.resultado === 'CUMPLE'
      ? cols.cumple
      : item.resultado === 'NO CUMPLE'
        ? cols.noCumple
        : cols.noAplica;

    sheet.getCell(targetRow, markCol).value = 'X';
    if (cols.obs && text(item.observacion)) sheet.getCell(targetRow, cols.obs).value = item.observacion;
    if (cols.reparacion && text(item.reparacion)) sheet.getCell(targetRow, cols.reparacion).value = item.reparacion;
  }
}

function fillOperativo(sheet, value) {
  const state = norm(value);
  if (!state) return;

  let found = null;
  sheet.eachRow((row, rowNumber) => {
    if (found) return;
    row.eachCell((cell, colNumber) => {
      const cellValue = norm(cellText(cell));
      if (!found && ['OPERATIVO', 'NO OPERATIVO'].includes(cellValue)) found = { row: rowNumber, col: colNumber };
    });
  });
  if (!found) return;

  const col = state.includes('NO OPERATIVO') ? found.col + 1 : found.col;
  sheet.getCell(found.row + 1, col).value = 'X';
}

function dispositionFrom(data) {
  const value = norm(`${data.procedimiento || ''} ${data.estado_final || ''}`);
  if (value.includes('BAJA')) return 'DE BAJA';
  if (value.includes('REPAR')) return 'REPARACION';
  if (value.includes('MANT') || value.includes('M.P') || value.includes('CALIB')) return 'MANTENCION';
  return null;
}

function fillDispositionByMap(sheet, data, map) {
  const target = dispositionFrom(data);
  if (!target || !map?.status) return false;
  if (target === 'REPARACION') markCell(sheet, map.status.reparacion);
  if (target === 'MANTENCION') markCell(sheet, map.status.mantencion);
  if (target === 'DE BAJA') markCell(sheet, map.status.de_baja);
  return true;
}

function fillDisposition(sheet, data) {
  const target = dispositionFrom(data);
  if (!target) return;

  let found = null;
  sheet.eachRow((row, rowNumber) => {
    if (found) return;
    const cols = {};
    row.eachCell((cell, colNumber) => {
      const value = norm(cellText(cell));
      if (value.includes('REPARACION')) cols.REPARACION = colNumber;
      if (value.includes('MANTENCION')) cols.MANTENCION = colNumber;
      if (value.includes('DE BAJA')) cols['DE BAJA'] = colNumber;
    });
    if (cols[target]) found = { row: rowNumber, col: cols[target] };
  });

  if (found) sheet.getCell(found.row + 1, found.col).value = 'X';
}

function fillTextByMap(sheet, data, map) {
  if (!map?.text) return false;
  Object.entries(map.text).forEach(([field, address]) => setCell(sheet, address, data[field]));
  if (map.status?.operativo && norm(data.prueba_funcionamiento).includes('CUMPLE')) markCell(sheet, map.status.operativo);
  if (map.status?.no_operativo && norm(data.prueba_funcionamiento).includes('NO CUMPLE')) markCell(sheet, map.status.no_operativo);
  return true;
}

function fillTextSections(sheet, data) {
  setBelowLabel(sheet, ['INSPECCIÓN VISUAL', 'INSPECCION VISUAL'], data.inspeccion_visual);
  setBelowLabel(sheet, ['PRUEBA DE FUNCIONAMIENTO'], data.prueba_funcionamiento, 2);
  setBelowLabel(sheet, ['DESARME'], data.desarme);
  setBelowLabel(sheet, ['PROCEDIMIENTO'], data.procedimiento);
  fillOperativo(sheet, data.prueba_funcionamiento);
}

function addTextBlocks(workbook, data) {
  const sheet = workbook.addWorksheet('EXTRACCION_JSON');
  const rows = [
    ['Campo', 'Valor'],
    ['Inspeccion visual', data.inspeccion_visual],
    ['Prueba funcionamiento', data.prueba_funcionamiento],
    ['Desarme', data.desarme],
    ['Procedimiento', data.procedimiento],
    ['Template', data.template_filename],
    ['Semaforo', data.semaforo],
    ['Confidence', data.confidence_score],
  ];
  rows.forEach((row) => sheet.addRow(row));
  sheet.getColumn(1).width = 28;
  sheet.getColumn(2).width = 90;
}

function addPhotos(workbook, photos = []) {
  if (!photos.length) return;
  const sheet = workbook.addWorksheet('FOTOS');
  sheet.getColumn(1).width = 28;
  sheet.getColumn(2).width = 80;
  sheet.addRow(['Archivo', 'Foto']);

  photos.forEach((photo, index) => {
    const row = 2 + index * 18;
    sheet.getCell(row, 1).value = photo.filename || `foto_${index + 1}`;
    const extension = photo.mimeType?.includes('png') ? 'png' : 'jpeg';
    const imageId = workbook.addImage({ buffer: photo.buffer, extension });
    sheet.addImage(imageId, { tl: { col: 1, row: row - 1 }, ext: { width: 420, height: 300 } });
  });
}

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
  addTextBlocks(workbook, extraction);
  addPhotos(workbook, photos);

  const outBuffer = await workbook.xlsx.writeBuffer();
  const filename = `${extraction.ot || 'SIN_OT'}_${Date.now()}_GENERADO.xlsx`;
  const uploaded = await uploadDriveFile({ buffer: outBuffer, filename, folderId: outputFolderId });

  return {
    filename,
    drive_file_id: uploaded.id,
    excel_url: uploaded.webViewLink,
  };
}
