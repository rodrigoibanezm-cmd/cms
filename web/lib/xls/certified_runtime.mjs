import { createHash } from 'crypto';

function getPath(context, path) {
  return path.split('.').reduce((value, key) => value?.[key], context);
}

export function verifyTemplateBytes(buffer, reference) {
  if (buffer.length !== reference.size_bytes) {
    throw new Error('Certified template size mismatch');
  }
  const hash = createHash('sha256').update(buffer).digest('hex');
  if (hash !== reference.sha256) throw new Error('Certified template hash mismatch');
}

export function applyCertifiedMapping(sheet, context, mapping) {
  for (const operation of mapping.operations) {
    if (operation.op !== 'set_cell') {
      throw new Error(`Unsupported certified operation: ${operation.op}`);
    }
    sheet.getCell(operation.target).value = getPath(context, operation.source) ?? null;
  }
}

export function createCertifiedGenerator({ downloadDriveFile, loadTemplateWorkbook }) {
  return async function generate({ extraction, report, renderContract }) {
    const reference = renderContract.template_reference;
    const templateBuffer = await downloadDriveFile(reference.drive_file_id);
    verifyTemplateBytes(templateBuffer, reference);
    const workbook = await loadTemplateWorkbook(templateBuffer, reference.filename);
    const sheet = workbook.worksheets[renderContract.render_metadata.sheet_index];
    if (!sheet) throw new Error('Certified render sheet does not exist');
    applyCertifiedMapping(sheet, { report, extraction }, renderContract.render_mapping);
    const outBuffer = await workbook.xlsx.writeBuffer();
    return {
      filename: `${extraction.ot || report.ot || 'SIN_OT'}_${Date.now()}_GENERADO.xlsx`,
      buffer: Buffer.from(outBuffer),
    };
  };
}
