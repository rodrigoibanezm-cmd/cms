const driveLib = require('../lib/templates/googleDrive');

module.exports = async function handler(req, res) {
  try {
    const rawFolder = req.query.folder || process.env.CANDIDATES_TEMPLATES_FOLDER_ID;
    const folder = driveLib.parseFolderId(rawFolder);
    if (!folder) {
      return res.status(400).json({ ok: false, error: 'Missing folder' });
    }
    const drive = driveLib.getDrive();
    const items = await driveLib.listChildren(drive, folder);
    return res.status(200).json({
      ok: true,
      count: items.length,
      items: items.map((item) => ({ name: item.name, mimeType: item.mimeType }))
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};
