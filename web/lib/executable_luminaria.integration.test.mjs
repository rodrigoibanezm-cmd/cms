import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { createRequire } from 'module';
import { createCertifiedGenerator } from './xls/certified_runtime.mjs';
import { selectCertifiedFamily } from './certified_family_selector.mjs';

const require = createRequire(import.meta.url);
const catalog = require('../../catalog/versions/v1.0.0/executable_luminaria.json');
const fixture = require('../../catalog/versions/v1.0.0/fixtures/luminaria_real_anonymized.json');
const DRIVE_URL = (id) => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

async function downloadDriveFile(id) {
  const response = await fetch(DRIVE_URL(id));
  if (!response.ok) throw new Error(`Drive download failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function loadTemplateWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

test('LUMINARIA clasifica y renderiza el maestro certificado real', { timeout: 60000 }, async () => {
  const selected = selectCertifiedFamily(catalog, fixture);
  assert.equal(selected.key, 'LUMINARIA');
  assert.equal(fixture.extraction.tool_name, 'TRIPODE');

  const generate = createCertifiedGenerator({ downloadDriveFile, loadTemplateWorkbook });
  const output = await generate({
    report: fixture.report,
    extraction: fixture.extraction,
    renderContract: selected.contract,
  });

  const rendered = await loadTemplateWorkbook(output.buffer);
  assert.equal(rendered.worksheets.length, 2);
  const sheet = rendered.worksheets[0];
  assert.equal(sheet.getCell('D7').value, 'MILWAUKEE');
  assert.equal(sheet.getCell('D8').value, '2130-20');
  assert.equal(sheet.getCell('I9').value, 'LUM-ANON-001');

  assert.equal(sheet.getCell('A5').value, ' INFORME TÉCNICO LUMINARIA INALÁMBRICA');
  assert.equal(sheet.getCell('C20').value, 'DESCRIPCIÓN');
  assert.equal(sheet.getCell('C21').value, 'ESTRUCTURA PRINCIPAL');
  assert.equal(rendered.worksheets[1].getCell('A4').value, 'REGISTRO FOTOGRAFICO');
});
