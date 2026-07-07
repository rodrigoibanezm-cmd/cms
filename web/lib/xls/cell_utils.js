export function text(v) {
  return String(v ?? '').trim();
}

export function norm(v) {
  return text(v)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

export function cellText(cell) {
  const value = cell.value;
  if (value?.richText) return value.richText.map((r) => r.text).join('');
  return value;
}

export function writableCell(cell) {
  return cell.isMerged && cell.master ? cell.master : cell;
}

export function makeValueVisible(cell, alignment = {}) {
  cell.font = {
    ...(cell.font || {}),
    bold: false,
    size: 18,
    color: { argb: 'FF000000' },
  };
  cell.alignment = {
    ...(cell.alignment || {}),
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true,
    ...alignment,
  };
}

export function setVisibleCell(cell, value, alignment = {}) {
  const target = writableCell(cell);
  target.value = value;
  makeValueVisible(target, alignment);
}

export function setCell(sheet, address, value) {
  if (!address || !text(value)) return;
  setVisibleCell(sheet.getCell(address), value);
}

export function clearCell(sheet, address) {
  if (!address) return;
  writableCell(sheet.getCell(address)).value = null;
}

export function markCell(sheet, address) {
  if (!address) return;
  setVisibleCell(sheet.getCell(address), 'X');
}

export function findCellByLabel(sheet, labels, options = {}) {
  const wanted = labels.map(norm);
  const maxRow = options.maxRow || Number.MAX_SAFE_INTEGER;
  let found = null;

  for (const exactOnly of [true, false]) {
    sheet.eachRow((row, rowNumber) => {
      if (found || rowNumber > maxRow) return;
      row.eachCell((cell, colNumber) => {
        const value = norm(cellText(cell));
        const match = exactOnly
          ? wanted.some((label) => value === label)
          : wanted.some((label) => value.includes(label));
        if (!found && match) found = { row: rowNumber, col: colNumber };
      });
    });
    if (found || options.exactOnly) break;
  }

  return found;
}

export function writableCellToRight(sheet, row, col) {
  for (let offset = 1; offset <= 6; offset++) {
    const cell = sheet.getCell(row, col + offset);
    if (!cell.isMerged || cell.master?.address === cell.address) return cell;
  }
  return sheet.getCell(row, col + 1);
}

export function setBesideLabel(sheet, labels, value, options = {}) {
  if (!text(value)) return;
  const found = findCellByLabel(sheet, labels, options);
  if (!found) return;
  setVisibleCell(writableCellToRight(sheet, found.row, found.col), value);
}

export function setBelowLabel(sheet, labels, value, offset = 1) {
  if (!text(value)) return;
  const found = findCellByLabel(sheet, labels);
  if (!found) return;

  setVisibleCell(sheet.getCell(found.row + offset, found.col), value, {
    vertical: 'top',
    horizontal: 'center',
  });
}
