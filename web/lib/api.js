// web/lib/api.js
export async function mockValidate({ photos, report }) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (!photos.length || !report.length) {
    return {
      color: 'yellow',
      message: 'Falta subir fotos del equipo o del informe.',
    };
  }

  return {
    color: 'green',
    message: 'Informe recibido correctamente.',
  };
}
