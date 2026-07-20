import { createHash } from 'crypto';
import { downloadDriveFile } from '../../../../lib/xls/google_drive.js';

const REFERENCE = {
  id: '1reHRuTAXxVC4-wy-4uw-z0BUuuQaxrzG',
  filename: 'ESMERIL_FINAL.xlsx',
  size: 34461,
  sha256: '1da08a7f4a6f0a868efa9135db7f48b8c214fc9de4b934b7256fb1da81b57778',
};

export async function GET() {
  try {
    const buffer = await downloadDriveFile(REFERENCE.id);
    const hash = createHash('sha256').update(buffer).digest('hex');
    if (buffer.length !== REFERENCE.size) throw new Error(`unexpected size ${buffer.length}`);
    if (hash !== REFERENCE.sha256) throw new Error(`unexpected SHA-256 ${hash}`);

    return new Response(buffer, {
      headers: {
        'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'content-disposition': `attachment; filename="${REFERENCE.filename}"`,
        'content-length': String(buffer.length),
        'cache-control': 'no-store',
        'x-template-source-sha': process.env.VERCEL_GIT_COMMIT_SHA || 'local',
      },
    });
  } catch (error) {
    console.error('[template:esmeril]', error);
    return Response.json({ error: `ESMERIL template unavailable: ${error.message}` }, { status: 502 });
  }
}
