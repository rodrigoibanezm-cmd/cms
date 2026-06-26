const driveLib = require('../../lib/templates/googleDrive');

module.exports = async function handler(req, res) {
  try {
    const folder = driveLib.parseFolderId(process.env.CANDIDATES_TEMPLATES_FOLDER_ID || req.query.folder);
    if (!folder) return res.status(400).json({ ok: false, error: 'Missing folder' });
    const drive = driveLib.getDrive();
    const items = await driveLib.listChildren(drive, folder);
    return res.status(200).json({ ok: true, count: items.length, items: items.map((x) => x.name) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};
