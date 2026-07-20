import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { applyCertifiedMapping, createCertifiedGenerator } from './certified_runtime.mjs';

function reference(buffer) {
  return {
    drive_file_id: 'drive-1', filename: 'template.xlsx', size_bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  };
}

function contract(buffer) {
  return {
    template_reference: reference(buffer),
    render_mapping: { operations: [{ op: 'set_cell', source: 'report.ot', target: 'B2' }] },
    render_metadata: { sheet_index: 0 },
  };
}

test('rechaza tamaño antes de abrir el workbook', async () => {
  const bytes = Buffer.from('template');
  let opened = false;
  const generate = createCertifiedGenerator({
    downloadDriveFile: async () => bytes,
    loadTemplateWorkbook: async () => { opened = true; },
  });
  const invalid = contract(bytes);
  invalid.template_reference.size_bytes += 1;
  await assert.rejects(() => generate({ extraction: {}, report: {}, renderContract: invalid }), /size mismatch/);
  assert.equal(opened, false);
});

test('rechaza hash antes de abrir el workbook', async () => {
  const bytes = Buffer.from('template');
  let opened = false;
  const generate = createCertifiedGenerator({
    downloadDriveFile: async () => bytes,
    loadTemplateWorkbook: async () => { opened = true; },
  });
  const invalid = contract(bytes);
  invalid.template_reference.sha256 = '0'.repeat(64);
  await assert.rejects(() => generate({ extraction: {}, report: {}, renderContract: invalid }), /hash mismatch/);
  assert.equal(opened, false);
});

test('ejecuta únicamente operaciones declaradas', () => {
  const cells = {};
  const sheet = { getCell: (target) => (cells[target] ||= {}) };
  applyCertifiedMapping(sheet, { report: { ot: '24530' }, extraction: {} }, {
    operations: [{ op: 'set_cell', source: 'report.ot', target: 'B2' }],
  });
  assert.equal(cells.B2.value, '24530');
});

test('el camino certificado se bifurca antes del legacy', async () => {
  const source = await readFile(new URL('../xls_generator.js', import.meta.url), 'utf8');
  const branch = source.indexOf('if (renderContract)');
  assert.ok(branch > 0);
  assert.ok(branch < source.indexOf("env('GOOGLE_DRIVE_TEMPLATES_FOLDER_ID')"));
  assert.ok(branch < source.indexOf('getCellMap(extraction.template_key)'));
});
