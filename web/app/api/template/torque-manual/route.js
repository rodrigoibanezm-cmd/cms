import { createHash } from 'crypto';
import { downloadDriveFile } from '../../../../lib/xls/google_drive.js';

const REFERENCE = {
  id: '1TV_3hb7v5pwkjGgcXaF_k74uUA6o6uoO',
  filename: 'TORQUE_MANUAL_FINAL.xlsx',
  size: 121247,
  sha256: '94673825c7f0b1b36e4bf9d840fc8c6bedf67ac770f43ec6094b9f4575c15bd0',
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
    console.error('[template:torque-manual]', error);
    return Response.json({ error: `TORQUE_MANUAL template unavailable: ${error.message}` }, { status: 502 });
  }
}
