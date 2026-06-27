const driveLib = require('../../../../lib/templates/googleDrive');

module.exports = async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ ok: false, error: 'Missing code' });

    const tokens = await driveLib.exchangeCode(req, code);
    return res.status(200).send(`
      <html><body style="font-family: system-ui; padding: 24px">
        <h2>Google OAuth OK</h2>
        <p>Copia este valor en Vercel como <b>GOOGLE_REFRESH_TOKEN</b>:</p>
        <textarea style="width:100%;height:120px">${tokens.refresh_token || ''}</textarea>
        <p>Si aparece vacío, vuelve a /api/auth/google y autoriza de nuevo.</p>
      </body></html>
    `);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};
