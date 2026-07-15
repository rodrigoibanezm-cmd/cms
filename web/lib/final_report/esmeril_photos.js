const SLOTS = [
  [2, 9, 3, 13], [9, 9, 12, 12], [5, 9, 9, 12], [3, 9, 5, 13],
  [2, 13, 3, 17], [9, 13, 12, 17], [12, 13, 14, 17], [3, 13, 6, 17],
  [6, 13, 9, 17], [2, 21, 3, 22], [3, 21, 6, 22], [6, 21, 10, 22],
];

export function addEsmerilPhotos(workbook, photos = []) {
  const sheet = workbook.worksheets[1];
  photos.slice(0, SLOTS.length).forEach((photo, index) => {
    const extension = photo.mimeType?.includes('png') ? 'png' : 'jpeg';
    const imageId = workbook.addImage({ buffer: photo.buffer, extension });
    const [c1, r1, c2, r2] = SLOTS[index];
    sheet.addImage(imageId, { tl: { col: c1, row: r1 }, br: { col: c2, row: r2 } });
  });
}
