const driveLib = require('../../../lib/templates/googleDrive');

module.exports = async function handler(req, res) {
  try {
    return res.status(200).json(driveLib.authDebug(req));
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};
