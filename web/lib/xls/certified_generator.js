import { createCertifiedGenerator } from './certified_runtime.mjs';
import { downloadDriveFile } from './google_drive.js';
import { loadTemplateWorkbook } from './template_loader.js';

export const generateFromCertifiedContract = createCertifiedGenerator({
  downloadDriveFile,
  loadTemplateWorkbook,
});
