function textOf(value) {
  if (value == null) return '';
  if (typeof value === 'object' && value.richText) return value.richText.map((part) => part.text || '').join('');
  if (typeof value === 'object' && value.text) return value.text;
  return String(value);
}

function norm(value) {
  return textOf(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

const HEADER_TARGETS = new Set(['CUMPLE', 'NO CUMPLE', 'NO APLICA', 'OBSERVACIONES', 'OBSERVACION', 'REPARACION']);
const INPUT_LABELS = new Set([
  'MARCA', 'MARCA :', 'MODELO', 'MODELO:', 'SERIE', 'CLIENTE', 'FAENA',
  'ROTULO', 'FECHA', 'TECNICO', 'OT', 'O.T', 'O.T.', 'CAPACIDAD', 'CUADRANTE',
]);
const DIRTY_TEXT = ['ANDRES FELIPE', 'FRANK', 'JEFE DE TALLER', 'JEFE DE AREA', 'TECNICO ESPECIALIZADO', 'ESCONDIDA'];

function clearCell(cell) {
  if (cell?.type === 1 || cell?.master === cell) cell.value = null;
}

function isInputLabel(value) {
  const clean = norm(value).replace(/\s+:/g, ':');
  return INPUT_LABELS.has(clean);
}

function isHeaderTarget(value) {
  return HEADER_TARGETS.has(norm(value));
}

function hasDirtyText(value) {
  const clean = norm(value);
  return DIRTY_TEXT.some((text) => clean.includes(text));
}

function clearRightOfLabels(sheet) {
  sheet.eachRow((row) => {
    row.eachCell((cell, colNumber) => {
      if (!isInputLabel(cell.value)) return;
      for (let col = colNumber + 1; col <= Math.min(colNumber + 4, sheet.columnCount); col += 1) {
        const target = row.getCell(col);
        if (isInputLabel(target.value)) break;
        clearCell(target);
      }
    });
  });
}

function clearChecklistColumns(sheet) {
  sheet.eachRow((row, rowNumber) => {
    const targetCols = [];
    row.eachCell((cell, colNumber) => {
      if (isHeaderTarget(cell.value)) targetCols.push(colNumber);
    });
    if (!targetCols.length) return;

    for (let r = rowNumber + 1; r <= sheet.rowCount; r += 1) {
      const targetRow = sheet.getRow(r);
      targetCols.forEach((col) => clearCell(targetRow.getCell(col)));
    }
  });
}

function clearDirtyText(sheet) {
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (hasDirtyText(cell.value)) clearCell(cell);
    });
  });
}

export function sanitizeTemplateWorkbook(workbook) {
  workbook.eachSheet((sheet) => {
    clearRightOfLabels(sheet);
    clearChecklistColumns(sheet);
    clearDirtyText(sheet);
  });
}
