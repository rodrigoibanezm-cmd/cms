const DRIVE_ID = '1hvXk282YSIhvcN6yzAm9U4SyDIjTassV';
const DRIVE_URL = `https://drive.usercontent.google.com/download?id=${DRIVE_ID}&export=download&confirm=t`;

export async function GET() {
  const response = await fetch(DRIVE_URL, { cache: 'no-store' });

  if (!response.ok) {
    return new Response('No se pudo descargar LUMINARIA_FINAL.xlsm', {
      status: response.status,
    });
  }

  return new Response(await response.arrayBuffer(), {
    headers: {
      'content-type': 'application/vnd.ms-excel.sheet.macroEnabled.12',
      'content-disposition': 'inline; filename="LUMINARIA_FINAL.xlsm"',
      'cache-control': 'no-store',
    },
  });
}
