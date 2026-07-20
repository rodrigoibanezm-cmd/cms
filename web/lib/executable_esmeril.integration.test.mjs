import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import { createRequire } from 'module';
import { createCertifiedGenerator } from './xls/certified_runtime.mjs';
import { selectCertifiedFamily } from './certified_family_selector.mjs';

const require = createRequire(import.meta.url);
const catalog = require('../../catalog/versions/v1.0.0/executable_esmeril.json');
const fixture = require('../../catalog/versions/v1.0.0/fixtures/esmeril_real_anonymized.json');
const TEMPLATE_URL = process.env.ESMERIL_TEMPLATE_URL
  || 'https://cms-git-feat-operational-catalog-v1-rodrigo-qrs-chile-s-projects.vercel.app/api/template/esmeril';

async function downloadDriveFile() {
  const response = await fetch(TEMPLATE_URL);
  assert.equal(response.status, 200, `Template endpoint failed: ${response.status}`);
  assert.doesNotMatch(response.headers.get('content-type') || '', /text\/html/i);
  assert.match(response.headers.get('content-disposition') || '', /ESMERIL_FINAL\.xlsx/);
  const buffer = Buffer.from(await response.arrayBuffer());
  assert.equal(buffer.length, 34461);
  assert.equal(createHash('sha256').update(buffer).digest('hex'), catalog.families.ESMERIL.template_reference.sha256);
  return buffer;
}

async function loadTemplateWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

test('ESMERIL clasifica y renderiza el maestro certificado real', { timeout: 60000 }, async () => {
  const selected = selectCertifiedFamily(catalog, fixture);
  assert.equal(selected.key, 'ESMERIL');
  assert.equal(fixture.extraction.tool_name, 'PULIDOR INALAMBRICO');

  const generate = createCertifiedGenerator({ downloadDriveFile, loadTemplateWorkbook });
  const output = await generate({
    report: fixture.report,
    extraction: fixture.extraction,
    renderContract: selected.contract,
  });

  const rendered = await loadTemplateWorkbook(output.buffer);
  assert.equal(rendered.worksheets.length, 2);
  const sheet = rendered.worksheets[0];
  assert.equal(sheet.getCell('D8').value, 'MILWAUKEE');
  assert.equal(sheet.getCell('D9').value, '2738-20');
  assert.equal(sheet.getCell('I11').value, 'ESM-ANON-001');

  assert.equal(sheet.getCell('A6').value, ' INFORME TECNICO ESMERIL ELECTRICO 7"');
  assert.equal(sheet.getCell('C23').value, 'DESCRIPCIÓN');
  assert.equal(sheet.getCell('C24').value, 'ESTRUCTURA PRINCIPAL');
  assert.equal(rendered.worksheets[1].getCell('A7').value, ' INFORME FOTOGRAFICO');
});
