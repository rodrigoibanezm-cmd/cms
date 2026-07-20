import { createHash } from 'crypto';
import { downloadDriveFile } from '../../../../lib/xls/google_drive.js';

const REFERENCE = {
  id: '1hvXk282YSIhvcN6yzAm9U4SyDIjTassV',
  filename: 'LUMINARIA_FINAL.xlsm',
  size: 47194,
  sha256: 'd5e851a95d0d7e25ab124c900e928cad443b8422c1c0ed6b8547744e32a6ae1a',
};

export async function GET() {
  try {
    const buffer = await downloadDriveFile(REFERENCE.id);
    const hash = createHash('sha256').update(buffer).digest('hex');
    if (buffer.length !== REFERENCE.size) throw new Error(`unexpected size ${buffer.length}`);
    if (hash !== REFERENCE.sha256) throw new Error(`unexpected SHA-256 ${hash}`);

    return new Response(buffer, {
      headers: {
        'content-type': 'application/vnd.ms-excel.sheet.macroenabled.12',
        'content-disposition': `attachment; filename="${REFERENCE.filename}"`,
        'content-length': String(buffer.length),
        'cache-control': 'no-store',
        'x-template-source-sha': process.env.VERCEL_GIT_COMMIT_SHA || 'local',
      },
    });
  } catch (error) {
    console.error('[template:luminaria]', error);
    return Response.json({ error: `LUMINARIA template unavailable: ${error.message}` }, { status: 502 });
  }
}
