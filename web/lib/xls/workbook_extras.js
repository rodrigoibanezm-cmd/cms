export function addTextBlocks(workbook, data) {
  const sheet = workbook.addWorksheet('EXTRACCION_JSON');
  sheet.getColumn(1).width = 120;
  sheet.getCell('A1').value = 'JSON_COMPLETO';
  sheet.getCell('A2').value = JSON.stringify(data, null, 2);
  sheet.getCell('A2').alignment = { wrapText: true, vertical: 'top' };
}

export function addPhotos(workbook, photos = []) {
  if (!photos.length) return;
  const sheet = workbook.addWorksheet('FOTOS');
  sheet.getColumn(1).width = 28;
  sheet.getColumn(2).width = 80;
  sheet.addRow(['Archivo', 'Foto']);

  photos.forEach((photo, index) => {
    const row = 2 + index * 18;
    sheet.getCell(row, 1).value = photo.filename || `foto_${index + 1}`;
    const extension = photo.mimeType?.includes('png') ? 'png' : 'jpeg';
    const imageId = workbook.addImage({ buffer: photo.buffer, extension });
    sheet.addImage(imageId, { tl: { col: 1, row: row - 1 }, ext: { width: 420, height: 300 } });
  });
}
