const driveLib = require('../../../lib/templates/googleDrive');
const { cleanWorkbook } = require('../../../lib/templates/cleanWorkbook');

function familyName(value) {
  return String(value || '').trim().toUpperCase();
}

function pickCandidate(files) {
  const xlsx = files.filter((file) => file.mimeType === driveLib.XLSX_MIME);
  if (!xlsx.length) throw new Error('No hay candidatos XLSX para esta familia');
  return xlsx.sort((a, b) => Number(b.size || 0) - Number(a.size || 0))[0];
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Use POST' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const family = familyName(body.family);
    if (!family) return res.status(400).json({ ok: false, error: 'Missing family' });

    const candidatesRoot = driveLib.parseFolderId(body.candidatesFolder || process.env.CANDIDATES_TEMPLATES_FOLDER_ID);
    const basesFolder = driveLib.parseFolderId(body.basesFolder || process.env.BASES_FOLDER_ID);
    if (!candidatesRoot) return res.status(400).json({ ok: false, error: 'Missing candidates folder' });
    if (!basesFolder) return res.status(400).json({ ok: false, error: 'Missing bases folder' });

    const drive = driveLib.getDrive(req);
    const familyFolder = await driveLib.findChildFolder(drive, candidatesRoot, family);
    const files = await driveLib.listChildren(drive, familyFolder.id, driveLib.XLSX_MIME);
    const candidate = pickCandidate(files);
    const sourceBuffer = await driveLib.downloadFileBuffer(drive, candidate.id);
    const cleanBuffer = await cleanWorkbook(sourceBuffer);
    const output = `${family}_TECNICOS_BASE.xlsx`;
    const uploaded = await driveLib.uploadXlsxBuffer(drive, basesFolder, output, Buffer.from(cleanBuffer));

    return res.status(200).json({
      ok: true,
      family,
      candidate: candidate.name,
      output: uploaded.name,
      fileId: uploaded.id,
      url: uploaded.webViewLink
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};
