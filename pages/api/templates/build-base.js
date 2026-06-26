const driveLib = require('../../../../lib/templates/googleDrive');
const { cleanWorkbook } = require('../../../../lib/templates/cleanWorkbook');

function normalizeFamily(value) {
  return String(value || '').trim().toUpperCase();
}

function outputName(family) {
  return `${normalizeFamily(family)}_TECNICOS_BASE.xlsx`;
}

function pickCandidate(files) {
  const xlsx = files.filter((file) => file.mimeType === driveLib.XLSX_MIME);
  if (!xlsx.length) throw new Error('No hay candidatos XLSX para esta familia');
  return xlsx.sort((a, b) => Number(b.size || 0) - Number(a.size || 0))[0];
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return {};
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Use POST' });
  }

  try {
    const body = await readJsonBody(req);
    const family = normalizeFamily(body.family);
    if (!family) return res.status(400).json({ ok: false, error: 'Missing family' });

    const candidatesRoot = driveLib.parseFolderId(
      body.candidatesFolder || process.env.CANDIDATES_TEMPLATES_FOLDER_ID
    );
    const basesFolder = driveLib.parseFolderId(
      body.basesFolder || process.env.BASES_FOLDER_ID
    );

    if (!candidatesRoot) return res.status(400).json({ ok: false, error: 'Missing candidates folder' });
    if (!basesFolder) return res.status(400).json({ ok: false, error: 'Missing bases folder' });

    const drive = driveLib.getDrive();
    const familyFolder = await driveLib.findChildFolder(drive, candidatesRoot, family);
    const files = await driveLib.listChildren(drive, familyFolder.id, driveLib.XLSX_MIME);
    const candidate = pickCandidate(files);
    const sourceBuffer = await driveLib.downloadFileBuffer(drive, candidate.id);
    const cleanBuffer = await cleanWorkbook(sourceBuffer);
    const uploaded = await driveLib.uploadXlsxBuffer(
      drive,
      basesFolder,
      outputName(family),
      Buffer.from(cleanBuffer)
    );

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
