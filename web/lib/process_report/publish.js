import { addReportFile } from '../report_store.js';
import { markXlsGenerated } from '../report_updates.js';
import { publishGeneratedXls } from '../xls_generator.js';

async function registerXls(reportId, xls) {
  await markXlsGenerated(reportId, xls);
  await addReportFile(reportId, {
    kind: 'generated_xls',
    filename: xls.filename,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    driveFileId: xls.drive_file_id,
    url: xls.excel_url,
  });
}

export async function publishFinalXls({ reportId, extraction, xls }) {
  const published = await publishGeneratedXls({ xls, extraction });
  await registerXls(reportId, published);
  return published;
}
